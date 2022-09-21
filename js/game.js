'use strict'

const MINE = '💣'
const EMPTY = '&nbsp;'
const FLAG = '🚩'


var gBoard

var gNegs = []

const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0
}

const gLevel = {
    SIZE: 12,
    MINES: 2
}


function initGame() {
    gBoard = buildBoard(gLevel.SIZE)
    placeMines(gBoard, gLevel.MINES)
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
                isShown: false,
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



            const isMine = (cell.isMine) ? MINE : (cell.minesAroundCount) ? cell.minesAroundCount : cell.minesAroundCount
            ///// change to empty


            const content = cell.isShown ? isMine : (cell.isMarked) ? FLAG:EMPTY

            const flipped = cell.isShown ? 'flipped' : ''

            const className = `cell ${flipped}`
            strHTML += `<td class="${className}" onclick="cellClicked(this)" oncontextmenu="cellRightClicked(this), event.preventDefault();" data-i=${i} data-j=${j}> ${content} </td>`
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

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            var negsCount = countNeg(gBoard, i, j)
            gBoard[i][j].minesAroundCount = negsCount
        }
    }
}

function cellClicked(cell) {
    console.log('left')
    const curCell = gBoard[cell.dataset.i][cell.dataset.j]
    console.log('curCell = ', curCell)
    if (curCell.minesAroundCount === 0) {
        
    }

    cell.classList.add('flipped')
    curCell.isShown = true
    renderBoard(gBoard)
}

function cellRightClicked(cell) {
    console.log('right');
    const curCell = gBoard[cell.dataset.i][cell.dataset.j]
    curCell.isMarked = curCell.isMarked ?  false : true
    renderBoard(gBoard)
}


function onMode(mode){
    console.log(mode);
    gLevel.SIZE = mode.dataset.r
    gLevel.MINES = mode.dataset.m
    initGame()
}