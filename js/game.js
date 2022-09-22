'use strict'

//cleanup
//do bonuses


const MINE = '💣'
const EMPTY = '&nbsp;'
const FLAG = '🚩'
const HEART = '❤'


var gBoard
var gTimerInterval


const gLevel = {
    SIZE: 12,
    MINES: 32,
    hearts: 3,
}

const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: gLevel.MINES,
    secsPassed: 0,
    lives: gLevel.hearts
}


function initGame() {
    gBoard = buildBoard(gLevel.SIZE)
    placeMines(gBoard, gLevel.MINES)
    setMinesNegsCount()
    renderBoard(gBoard)
}

function buildBoard(rows, cols = rows) {
    const board = []
    for (var i = 0; i < rows; i++) {
        board[i] = []
        for (var j = 0; j < cols; j++) {
            board[i][j] = {
                minesAroundCount: 0,
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

            const isMine = (cell.isMine) ? MINE : (cell.minesAroundCount) ? cell.minesAroundCount : EMPTY

            ///// change last isMine to empty
            const content = cell.isShown ? isMine : (cell.isMarked) ? FLAG : EMPTY
            const flipped = cell.isShown ? 'flipped' : ''
            const className = `cell ${flipped}`
            const color = returnColor(cell.minesAroundCount)



            strHTML += `<td class="${className}" onclick="cellClicked(this)" oncontextmenu="cellRightClicked(this), event.preventDefault();" data-i=${i} data-j=${j}
            style="color:${color} ;">${content} </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
    var flag = document.querySelector('.flags span')
    flag.innerText = gGame.markedCount
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
    const curCell = gBoard[cell.dataset.i][cell.dataset.j]
    startTimer()
    if (curCell.isShown) return
    if (!curCell.minesAroundCount) {
        expandShown(gBoard, +cell.dataset.i, +cell.dataset.j)

    } else if (curCell.isMine) {
        checkGameOver()
    }
    gGame.shownCount++
    cell.classList.add('flipped')
    curCell.isShown = true
    checkVictory()
    renderBoard(gBoard)
}

function cellRightClicked(cell) {
    //// FLAGS
    startTimer()
    const curCell = gBoard[cell.dataset.i][cell.dataset.j]
    if (curCell.isShown) return

    if (curCell.isMarked) {
        curCell.isMarked = false
        gGame.markedCount += 1

    } else {
        if (!gGame.markedCount) return
        curCell.isMarked = true
        gGame.markedCount -= 1
    }
    checkVictory()
    renderBoard(gBoard)
}


function onMode(mode) {
    var flag = document.querySelector('.flags span')
    var hearts = document.querySelector('.life')
    flag.innerText = mode.dataset.m
    gLevel.SIZE = mode.dataset.r
    gLevel.MINES = mode.dataset.m
    gGame.markedCount = mode.dataset.m
    gLevel.hearts = mode.dataset.h
    hearts.innerText = HEART.repeat(gLevel.hearts)

    restart()
}



function startTimer() {
    const timer = document.querySelector('.game-info h3')
    if (gTimerInterval) return
    gTimerInterval = setInterval(function () {
        timer.innerText = ++gGame.secsPassed + '/s'

    }, 1000)
}


function restart() {
    const endScreen = document.querySelector('.end-screen')
    const hearts = document.querySelector('.life')
    const timer = document.querySelector('.game-info h3')
    clearInterval(gTimerInterval)
    timer.innerText = 0 + '/s'
    gGame.lives = gLevel.hearts
    gGame.secsPassed = 0
    gGame.shownCount = 0
    gGame.markedCount = gLevel.MINES
    gTimerInterval = null
    endScreen.style.display = 'none'
    hearts.innerText = HEART.repeat(gLevel.hearts)
    initGame()
}



function expandShown(board, rowIdx, colIdx) {
    // var negs = getNegs(gBoard,rowIdx,colIdx)
    // for (var i = 0; i < negs.length; i++) {
    //     if (i < 0 || i >= board.length) continue
    //     for (var j = colIdx - 1; j <= colIdx + 1; j++) {
    //         if(gBoard[negs[i].i][negs[i].j].isShown) gGame.markedCount++
    //         if(!gBoard[negs[i].i][negs[i].j].isMine){
    //             gBoard[negs[i].i][negs[i].j].isShown = true
    //             if(!gBoard[negs[i].i][negs[i].j].minesAroundCount){
    //                 expandShown(gBoard,[negs[i].i],[negs[i].j])
    //             }
    //         }
    //     }
    // }


    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (!board[i][j].isShown) gGame.shownCount++
            if (!board[i][j].isMine) board[i][j].isShown = true


        }
    }


}

function checkGameOver() {
    const hearts = document.querySelector('.life')
    const greet = document.querySelector('.greet')
    const endScreen = document.querySelector('.end-screen')
    gGame.lives--
    hearts.innerText = HEART.repeat(gGame.lives)
    if (!gGame.lives) {
        clearInterval(gTimerInterval)
        console.log('gameOver')
        greet.innerText = 'Solid effort'
        endScreen.style.display = 'flex'
        revealBoard(gBoard)

    }
    renderBoard(gBoard)
}


function checkVictory() {
    const endScreen = document.querySelector('.end-screen')
    const greet = document.querySelector('.greet')
    if (!gGame.markedCount && gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES) {
        clearInterval(gTimerInterval)
        greet.innerText = 'Victory!'
        endScreen.style.display = 'flex'


    }
}



function revealBoard(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            gBoard[i][j].isShown = true
        }
    }
}

function getNegs(board, rowIdx, colIdx) {
    var negs = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (gBoard[i][j].isShown) continue
            if (gBoard[i][j].isMarked) continue
            negs.push({ i, j })

        }
    }
    return negs
}

function returnColor(num) {
    switch (num) {
        case 1:
            return '#467917'
        case 2:
            return '#339720'
        case 3:
            return 'olive'
        case 4:
            return '#ad8332'
        case 5:
            return '#FF6B6B'
        case 6:
        case 7:
        case 8:
            return '#f21717'
        default:
            return ''
    }
}