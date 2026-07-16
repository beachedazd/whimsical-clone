export const emptyContent = (type) => {
    if (type === 'doc')
        return { html: '' };
    return { shapes: [], connectors: [] };
};
export const FILE_TYPE_LABELS = {
    flowchart: 'Flowchart',
    wireframe: 'Wireframe',
    sticky: 'Sticky board',
    doc: 'Doc',
};
/** Sticky note palette from design mock 1f */
export const STICKY_COLORS = ['#ffe28a', '#ffb3c1', '#a8e6cf', '#b7d8ff'];
/** Flowchart shape accent colors from design mocks */
export const SHAPE_COLORS = {
    violet: 'var(--violet)',
    teal: 'var(--teal)',
    amber: '#e8b24a',
    red: '#c05b5b',
};
