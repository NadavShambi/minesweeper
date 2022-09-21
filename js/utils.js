'use strict'


// function renderBoard(board, selector) {

//     var strHTML = '<table border="0"><tbody>'
//     for (var i = 0; i < board.length; i++) {

//         strHTML += '<tr>'
//         for (var j = 0; j < board[0].length; j++) {
//             const cell = board[i][j]
//             const className = `cell cell-${i}-${j}`

//             strHTML += `<td class="${className}">${cell}</td>`
//         }
//         strHTML += '</tr>'
//     }
//     strHTML += '</tbody></table>'

//     const elContainer = document.querySelector(selector)
//     elContainer.innerHTML = strHTML
// }

// location is an object like this - { i: 2, j: 7 }
function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}


function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function getEmptyCells(board) {
    var emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 1; j < board[0].length - 1; j++) {
            if (board[i][j] === EMPTY) {
                var coord = { i: i, j: j }
                emptyCells.push(coord)
            }
        }
    }
    if (!emptyCells.length) return null
    return emptyCells
}

function drawRandom(array) {
    var idx = getRandomInt(0, array.length)
    var value = array.splice(idx,1)
    var res = {array,value}
    return res
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}


function countNeg(board, rowIdx, colIdx) {
    var negCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (board[i][j].isMine) negCount++
        }
    }
    return negCount
}



// function createBoard(rows, cols) {
//     var board = []
//     for (var i = 0; i < rows; i++) {
//         board[i] = []
//         for (var j = 0; j < cols; j++) {
//             const res = (Math.random() > .7) ? MINE : EMPTY
//             board[i][j] = res
//         }
//     }
//     return board
// }

