'use strict'

const MINE = '💣'
const EMPTY = '&nbsp;'
const FLAG = '🚩'


var gBoard

const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0
}

const gLevel = {
    SIZE: 10,
    MINES: 2
}


function initGame() {
    gBoard = buildBoard(gLevel.SIZE)
    placeMines(gBoard, 2)
    setMinesNegsCount()

    renderBoard(gBoard)
    console.log(gBoard);
}


function buildBoard(rows, cols = rows) {
    const board = []
    for (var i = 0; i < rows; i++) {
        board[i] = []
        for (var j = 0; j < cols; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                location: { i, j },
                isShown: true,
                isMine: false,
                isMarked: false,
            }
        }
    }
    return board
}


function renderBoard(board, selector = '.board') {

    var strHTML = '<tbody>'
    for (var i = 0; i < board.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            const content = (cell.isMine) ? MINE : cell.minesAroundCount 
            const className = `cell cell-${i}-${j}`

            strHTML += `<td class="${className}" onclick="cellClicked(this)" data-i=${i} data-j=${j}> ${content} </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

function placeMines(board, num) {
    var copy = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine) continue
            copy.push(board[i][j])
        }
    }
    for (var j = 0; j < num; j++) {
        var chosenCell = drawRandom(copy)
        chosenCell.value[0].isMine = true
    }
}

function setMinesNegsCount(){
    for(var i = 0; i < gBoard.length; i++){
        for (let j = 0; j < gBoard[0].length; j++) {
            var negsCount = countNeg(gBoard, i, j)
            gBoard[i][j].minesAroundCount = negsCount
        }
    }
}
