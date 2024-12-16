interface submenulist {
    id: number,
    name: string,
    parentId: number
}

export const submenulist: submenulist[] = [
    {
        id: 1,
        name: 'country',
        parentId: 1
    },
    {
        id: 2,
        name: 'state',
        parentId: 1
    },
    {
        id: 3,
        name: 'city',
        parentId: 1
    }
]