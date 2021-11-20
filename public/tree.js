socket.on('otm-tree-changed', rawTree => {
    
    const tree = JSON.parse(rawTree)
    $('#tree-container').html('')
    console.log('tree', tree)

    const groupedTree = groupBy(tree, v => v.parentId)

    for (groupParentId in groupedTree) {

        const group = groupedTree[groupParentId]

        let groupParent = $(`#${groupParentId}`)
        if (!groupParent.length && groupParentId == 'null') groupParent = $('#tree-container')
        else if (!groupParent.length) {
            groupParent = $(`<li id="${groupParentId}"><span class="tf-nc">${groupParentId}</span></li>`)
            $('#tree-container').append('<ul></ul>').append(groupParent)
        }

        const groupWrap = $('<ul></ul>')
        for (node of group) {

            let peer = $(`#${node.id}`)
            if (!peer.length) peer = $(`<li id="${node.id}"><span class="tf-nc">${node.id}</span></li>`)
            groupWrap.append(peer.clone())
            peer.remove()
        }

        groupParent.append(groupWrap)
        // alert('pause')
    }
})

const groupBy = (x,f)=>x.reduce((a,b)=>((a[f(b)]||=[]).push(b),a),{});