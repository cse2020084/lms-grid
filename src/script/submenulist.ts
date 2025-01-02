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
    },
    {
        id:4,
        name:'department',
        parentId:1
    },
    {
        id:5,
        name:'sub-department',
        parentId:1
    },
    {
        id:6,
        name:'role',
        parentId:1
    },
    {
        id:7,
        name:'designation',
        parentId:1
    },
    {
        id:8,
        name:'salutation',
        parentId:1
    }
]