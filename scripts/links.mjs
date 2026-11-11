import { posix } from 'node:path';

/**
 * Resolve one source-relative URL against the pinned repository inventory.
 * Known documentation and assets stay in the hub; other files retain their
 * upstream commit URL. The caller owns warning collection and performs no I/O here.
 * @param {object} options Source inventory and link context.
 * @returns {{url: string, warning?: string}} Destination and optional source defect.
 */
export function resolveLink(options) {
    const { destination, page, source, inventory } = options;
    const isExternal = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(destination);

    if (isExternal || destination.startsWith('#') || destination.length === 0) {
        return { url: destination };
    }

    // Resolve from the source root so root-relative screenshots keep their original meaning.
    const separator = destination.search(/[?#]/);
    const pathname = separator < 0 ? destination : destination.slice(0, separator);
    const suffix = separator < 0 ? '' : destination.slice(separator);
    let decoded;

    try {
        decoded = decodeURIComponent(pathname);
    } catch {
        return { url: source.url, warning: `Malformed URL: ${destination}` };
    }

    const directory = posix.dirname(page);
    const target = posix.normalize(posix.join(directory, decoded));
    const resolved = decoded.startsWith('/') ? posix.normalize(decoded.slice(1)) : target;

    if (resolved === '..' || resolved.startsWith('../')) {
        const original = page.split('/').map(encodeURIComponent).join('/');
        return { url: `${source.url}/blob/${source.commit}/${original}`,
            warning: `Reference escapes source repository: ${destination}` };
    }
    const candidates = [resolved, posix.join(resolved, 'README.md'), posix.join(resolved, 'index.md')];
    const selected = candidates.find(candidate => inventory.includes(candidate));

    if (selected) {
        const relative = posix.relative(directory, selected);
        const prefix = relative.startsWith('.') ? '' : './';
        return { url: `${prefix}${relative}${suffix}` };
    }

    // Keep references to code, releases and excluded pages useful without pretending they are hub pages.
    const encoded = resolved.split('/').map(encodeURIComponent).join('/');
    const upstream = `${source.url}/blob/${source.commit}/${encoded}${suffix}`;
    return { url: upstream, warning: `Upstream reference: ${destination}` };
}
