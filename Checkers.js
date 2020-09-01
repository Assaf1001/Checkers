const board = document.getElementById('board')
const allSlots = document.getElementsByClassName('all')
const modal = document.getElementById('modal')
const modalBox = document.getElementById('modal-box')
const gameOverMessage = document.getElementById('message')

var selectedPiece 
var selectedSlot
var mustCapturePiece
var promototedKingId
var opponentPieceLocation
var idNumber = 1
var emptySlotNumber = 13
var whiteKingNumber = 1
var blackKingNumber = 1
var opponentPiecesOnKingsPath = 0
var teamPiecesOnKingsPath = 0
var movesCount = 0
var isFirstTimeOpponentPieceLocation = true
var isWhiteTurn = true 
var isKingPromoted = false
var isMustCapture = false
var isFirstCapture = false
var isCaptureBackwards = false
var isKingMustCapture = false 

for(let x=0; x<8; x++){         // Visual Board Creation
    for(let y=0; y<8; y++){
        const square = document.createElement('div')
        if (x%2 === 0)
            square.className=y%2 === 0 ? 'blueBoard' : 'greenBoard'
        else
            square.className=y%2 === 0 ? 'greenBoard' : 'blueBoard'
        board.appendChild(square)
    }
}
for (let i=0; i<64; i++){   // Visual Board Id Names
    if (board.childNodes[i].className === 'greenBoard'){
        var piece = document.createElement('div')
        piece.className = i<24 ? 'piece black all' : i>39 ? 'piece white all' : 'empty all'
        piece.id = piece.className === 'piece black all' ? 'b'+ idNumber++ : piece.className === 'piece white all' ? 'w' + idNumber++ : 'e' + idNumber++
        idNumber = idNumber === 13 ? 1 : i === 39 ? 1 : idNumber
        board.childNodes[i].appendChild(piece)
    }
}
var boardRepresentation = [   // Board Representation Creation
    [undefined, 'b1', undefined, 'b2', undefined, 'b3', undefined, 'b4'] ,
    ['b5', undefined, 'b6', undefined, 'b7', undefined, 'b8', undefined] ,
    [undefined, 'b9', undefined, 'b10', undefined, 'b11', undefined, 'b12'] ,
    ['e1', undefined, 'e2', undefined, 'e3', undefined, 'e4', undefined] ,
    [undefined, 'e5', undefined, 'e6', undefined, 'e7', undefined, 'e8'] , 
    ['w1', undefined, 'w2', undefined, 'w3', undefined, 'w4', undefined] , 
    [undefined, 'w5', undefined, 'w6', undefined, 'w7', undefined, 'w8'] ,
    ['w9', undefined, 'w10', undefined, 'w11', undefined, 'w12', undefined] 
]

function Location (row ,column){
    this.row = row
    this.column = column
}
function Move (from, to){
    this.from = from
    this.to = to
}

function playerTurnDisplay(isWhiteTurn){
    document.getElementById(isWhiteTurn?'black-player':'white-player').id = isWhiteTurn?'white-player':'black-player'
    document.getElementById(isWhiteTurn?'white-player':'black-player').innerHTML = isWhiteTurn?'White Player':'Black Player'
}
function addScoreBoardPiece(isWhiteTurn) {
    const scoreBoardPiece = document.createElement('div')
    scoreBoardPiece.className = 'score-board-piece'
    scoreBoardPiece.id = isWhiteTurn?'score-board-black':'score-board-white'
    document.getElementById(isWhiteTurn?'white-score':'black-score').appendChild(scoreBoardPiece)
}
function isLegalSelect(selectedPiece, boardRepresentation, isWhiteTurn){
    for (let i=0; i<8; i++){
        if (boardRepresentation[i].indexOf(selectedPiece) !== -1){
            var pieceLocation = new Location(i,boardRepresentation[i].indexOf(selectedPiece))
            break
        }
    }
    if (((isWhiteTurn || selectedPiece.includes('k')) && (pieceLocation.row-1<8 && pieceLocation.row-1>=0 && (pieceLocation.column-1<8 && pieceLocation.column-1>=0 && boardRepresentation[pieceLocation.row-1][pieceLocation.column-1].includes('e') || pieceLocation.column+1<8 && pieceLocation.column+1>=0 && boardRepresentation[pieceLocation.row-1][pieceLocation.column+1].includes('e')))) ||
        pieceLocation.row-2<8 && pieceLocation.row-2>=0 && (pieceLocation.column-2<8 && pieceLocation.column-2>=0 && boardRepresentation[pieceLocation.row-1][pieceLocation.column-1].includes('b') && boardRepresentation[pieceLocation.row-2][pieceLocation.column-2].includes('e') || pieceLocation.column+2<8 && pieceLocation.column+2>=0 && boardRepresentation[pieceLocation.row-1][pieceLocation.column+1].includes('b') && boardRepresentation[pieceLocation.row-2][pieceLocation.column+2].includes('e')))
        return true
    else if (((!isWhiteTurn || selectedPiece.includes('k')) && (pieceLocation.row+1<8 && pieceLocation.row+1>=0 && (pieceLocation.column-1<8 && pieceLocation.column-1>=0 && boardRepresentation[pieceLocation.row+1][pieceLocation.column-1].includes('e') || pieceLocation.column+1<8 && pieceLocation.column+1>=0 && boardRepresentation[pieceLocation.row+1][pieceLocation.column+1].includes('e')))) ||
            pieceLocation.row+2<8 && pieceLocation.row+2>=0 && (pieceLocation.column-2<8 && pieceLocation.column-2>=0 && boardRepresentation[pieceLocation.row+1][pieceLocation.column-1].includes('w') && boardRepresentation[pieceLocation.row+2][pieceLocation.column-2].includes('e') || pieceLocation.column+2<8 && pieceLocation.column+2>=0 && boardRepresentation[pieceLocation.row+1][pieceLocation.column+1].includes('w') && boardRepresentation[pieceLocation.row+2][pieceLocation.column+2].includes('e')))
            return true
    return false
}
function isLegalMove(selectedPiece, selectedSlot, boardRepresentation, isWhiteTurn){
    move = convertStringsIntoMove(selectedPiece, selectedSlot, boardRepresentation)
    //Up Left+Right
    if (!isMustCapture && isWhiteTurn && !selectedPiece.includes('k') && move.from.row - move.to.row === 1 && (move.to.column - move.from.column === 1 || move.from.column - move.to.column === 1)){
        boardRepresentationMove(move, boardRepresentation, isWhiteTurn)
        movesCount = 0
        return true
    }
    //Down Left+Right
    else if (!isMustCapture && !isWhiteTurn && !selectedPiece.includes('k') && move.to.row - move.from.row === 1 && (move.to.column - move.from.column === 1 || move.from.column - move.to.column === 1)){
        boardRepresentationMove(move, boardRepresentation, isWhiteTurn)
        movesCount = 0
        return true
    }
    //Piece Capturing
    if  (isCapturing(move, boardRepresentation, isWhiteTurn)){
        boardRepresentationMove(move, boardRepresentation, isWhiteTurn)
        addScoreBoardPiece(isWhiteTurn)
        movesCount = 0
        return true
    }
    //Double Capturing
    if (isFirstCapture && isCapturingBackwards(move, boardRepresentation, isWhiteTurn)){
        boardRepresentationMove(move, boardRepresentation, isWhiteTurn)
        addScoreBoardPiece(isWhiteTurn)
        movesCount = 0
        return true
    }
    //King All Directions
    if (selectedPiece.includes('k') && isKingLegalMove(move)){
        boardRepresentationMove(move, boardRepresentation, isWhiteTurn)
        return true
    }
    return false
}
function convertStringsIntoMove(selectedPiece, selectedSlot, boardRepresentation){
    for (let i=0; i<8; i++){
        if (boardRepresentation[i].indexOf(selectedPiece) !== -1)
            var from = new Location(i,boardRepresentation[i].indexOf(selectedPiece))
        if (boardRepresentation[i].indexOf(selectedSlot) !== -1)
            var to = new Location(i,boardRepresentation[i].indexOf(selectedSlot))
    }
    move = new Move (from, to)
    return move
}
function isCapturing(move, boardRepresentation, isWhiteTurn){
    if (isWhiteTurn){
        //Up Left
        if (move.from.row - move.to.row === 2 && move.from.column - move.to.column === 2 && boardRepresentation[move.from.row - 1][move.from.column - 1].includes('b')){
            document.getElementById(boardRepresentation[move.from.row - 1][move.from.column - 1]).className = 'empty all'
            document.getElementById(boardRepresentation[move.from.row - 1][move.from.column - 1]).id = 'e' + emptySlotNumber
            boardRepresentation[move.from.row - 1][move.from.column - 1] = 'e' + emptySlotNumber++
            return true
        //Up Right
        } else if (move.from.row - move.to.row === 2 && move.to.column - move.from.column === 2 && boardRepresentation[move.from.row - 1][move.from.column + 1].includes('b')){
            document.getElementById(boardRepresentation[move.from.row - 1][move.from.column + 1]).className = 'empty all'
            document.getElementById(boardRepresentation[move.from.row - 1][move.from.column + 1]).id = 'e' + emptySlotNumber
            boardRepresentation[move.from.row - 1][move.from.column + 1] = 'e' + emptySlotNumber++
            return true
        }
    }else {
        //Down Left
        if (move.to.row - move.from.row === 2 && move.from.column - move.to.column === 2 && boardRepresentation[move.from.row + 1][move.from.column - 1].includes('w')){
            document.getElementById(boardRepresentation[move.from.row + 1][move.from.column - 1]).className = 'empty all'
            document.getElementById(boardRepresentation[move.from.row + 1][move.from.column - 1]).id = 'e' + emptySlotNumber
            boardRepresentation[move.from.row + 1][move.from.column - 1] = 'e' + emptySlotNumber++
            return true
        //Down Right
        } else if (move.to.row - move.from.row === 2 && move.to.column - move.from.column === 2 && boardRepresentation[move.from.row + 1][move.from.column + 1].includes('w')){
            document.getElementById(boardRepresentation[move.from.row + 1][move.from.column + 1]).className = 'empty all'
            document.getElementById(boardRepresentation[move.from.row + 1][move.from.column + 1]).id = 'e' + emptySlotNumber
            boardRepresentation[move.from.row + 1][move.from.column + 1] = 'e' + emptySlotNumber++
            return true
        }
    }
    return false
}
function canCaptureBackwards(move, boardRepresentation, isWhiteTurn){
    if (!isWhiteTurn){
        //Up Left
        if (move.to.row-2<8 && move.to.row-2>=0 && move.to.column-2<8 && move.to.column-2>=0 && boardRepresentation[move.to.row - 1][move.to.column - 1].includes('w') && boardRepresentation[move.to.row - 2][move.to.column - 2].includes('e')){
            document.getElementById(boardRepresentation[move.to.row][move.to.column]).classList.add('select-ring')
            mustCapturePiece = boardRepresentation[move.to.row][move.to.column]
            return true
        //Up Right
        } if (move.to.row-2<8 && move.to.row-2>=0 && move.to.column+2<8 && move.to.column+2>=0 && boardRepresentation[move.to.row - 1][move.to.column + 1].includes('w') && boardRepresentation[move.to.row - 2][move.to.column + 2].includes('e')){
            document.getElementById(boardRepresentation[move.to.row][move.to.column]).classList.add('select-ring')
            mustCapturePiece = boardRepresentation[move.to.row][move.to.column]
            return true
        }
    }else {
        //Down Left
        if (move.to.row+2<8 && move.to.row+2>=0 && move.to.column-2<8 && move.to.column-2>=0 && boardRepresentation[move.to.row + 1][move.to.column - 1].includes('b') && boardRepresentation[move.to.row + 2][move.to.column - 2].includes('e')){
            document.getElementById(boardRepresentation[move.to.row][move.to.column]).classList.add('select-ring')
            mustCapturePiece = boardRepresentation[move.to.row][move.to.column]
            return true
        //Down Right
        } if (move.to.row+2<8 && move.to.row+2>=0 && move.to.column+2<8 && move.to.column+2>=0 && boardRepresentation[move.to.row + 1][move.to.column + 1].includes('b') && boardRepresentation[move.to.row + 2][move.to.column + 2].includes('e')){
            document.getElementById(boardRepresentation[move.to.row][move.to.column]).classList.add('select-ring')
            mustCapturePiece = boardRepresentation[move.to.row][move.to.column]
            return true
        }
    }
    return false
}
function isCapturingBackwards(move, boardRepresentation, isWhiteTurn){
    if (!isWhiteTurn){
        //Up Left
        if (move.from.row - move.to.row === 2 && move.from.column - move.to.column === 2 && boardRepresentation[move.from.row - 1][move.from.column - 1].includes('w')){
            document.getElementById(boardRepresentation[move.from.row - 1][move.from.column - 1]).className = 'empty all'
            document.getElementById(boardRepresentation[move.from.row - 1][move.from.column - 1]).id = 'e' + emptySlotNumber
            boardRepresentation[move.from.row - 1][move.from.column - 1] = 'e' + emptySlotNumber++
            return true
        //Up Right
        } else if (move.from.row - move.to.row === 2 && move.to.column - move.from.column === 2 && boardRepresentation[move.from.row - 1][move.from.column + 1].includes('w')){
            document.getElementById(boardRepresentation[move.from.row - 1][move.from.column + 1]).className = 'empty all'
            document.getElementById(boardRepresentation[move.from.row - 1][move.from.column + 1]).id = 'e' + emptySlotNumber
            boardRepresentation[move.from.row - 1][move.from.column + 1] = 'e' + emptySlotNumber++
            return true
        }
    }else {
        //Down Left
        if (move.to.row - move.from.row === 2 && move.from.column - move.to.column === 2 && boardRepresentation[move.from.row + 1][move.from.column - 1].includes('b')){
            document.getElementById(boardRepresentation[move.from.row + 1][move.from.column - 1]).className = 'empty all'
            document.getElementById(boardRepresentation[move.from.row + 1][move.from.column - 1]).id = 'e' + emptySlotNumber
            boardRepresentation[move.from.row + 1][move.from.column - 1] = 'e' + emptySlotNumber++
            return true
        //Down Right
        } else if (move.to.row - move.from.row === 2 && move.to.column - move.from.column === 2 && boardRepresentation[move.from.row + 1][move.from.column + 1].includes('b')){
            document.getElementById(boardRepresentation[move.from.row + 1][move.from.column + 1]).className = 'empty all'
            document.getElementById(boardRepresentation[move.from.row + 1][move.from.column + 1]).id = 'e' + emptySlotNumber
            boardRepresentation[move.from.row + 1][move.from.column + 1] = 'e' + emptySlotNumber++
            return true
        }
    }
    return false
}
function boardRepresentationMove(move, boardRepresentation, isWhiteTurn){
        var location1 = boardRepresentation[move.from.row][move.from.column]
        boardRepresentation[move.to.row][move.to.column] = boardRepresentation[move.from.row][move.from.column]
        boardRepresentation[move.from.row][move.from.column] =  'e' + selectedSlot.slice(1,selectedSlot.length)
        if (isMustCapture && (isMustCpatureSelcet(location1, boardRepresentation, isWhiteTurn) || canCaptureBackwards(move, boardRepresentation, isWhiteTurn) || isKingMustCaptureing(move, boardRepresentation, isWhiteTurn))){
            isFirstCapture = true
            isMustCapture = true
        }else {
            isFirstCapture = false
            isMustCapture = false 
            isCaptureBackwards = false
        }
    if ((isWhiteTurn && move.to.row === 0) || (!isWhiteTurn && move.to.row === 7))
        promotion(move, boardRepresentation, isWhiteTurn)
}
function promotion(move, boardRepresentation, isWhiteTurn){
    boardRepresentation[move.to.row][move.to.column] = (isWhiteTurn?'w':'b') + 'k' + (isWhiteTurn ? whiteKingNumber++ : blackKingNumber++)
    promototedKingId = boardRepresentation[move.to.row][move.to.column]
    isKingPromoted = true
}
function isKingLegalMove(move){
    //Up Left
    if (move.from.row - move.to.row == move.from.column - move.to.column && move.from.row - move.to.row >= 0 && move.from.column - move.to.column >= 0){
        KingMoveingUpLeft(move, boardRepresentation, isWhiteTurn)
        return isKingCapturingAndNotBlockedByTeamPiece(boardRepresentation)
    }
    //Up Right
    if (move.from.row - move.to.row == move.to.column - move.from.column && move.from.row - move.to.row >= 0 && move.to.column - move.from.column >= 0){
        KingMoveingUpRight(move, boardRepresentation, isWhiteTurn)
        return isKingCapturingAndNotBlockedByTeamPiece(boardRepresentation)
    }
    //Down Left
    if (move.to.row - move.from.row == move.from.column - move.to.column && move.to.row - move.from.row >= 0 && move.from.column - move.to.column >= 0){
        KingMoveingDownLeft(move, boardRepresentation, isWhiteTurn)
        return isKingCapturingAndNotBlockedByTeamPiece(boardRepresentation)
    }
    //Down Right
    if (move.to.row - move.from.row == move.to.column - move.from.column && move.to.row - move.from.row >= 0 && move.to.column - move.from.column >= 0){
        KingMoveingDownRight(move, boardRepresentation, isWhiteTurn)
        return isKingCapturingAndNotBlockedByTeamPiece(boardRepresentation)
    }
    return false 
}
function isKingCapturingAndNotBlockedByTeamPiece(boardRepresentation){
    if (opponentPiecesOnKingsPath === 1 && teamPiecesOnKingsPath === 0){
        document.getElementById(boardRepresentation[opponentPieceLocation.row][opponentPieceLocation.column]).className = 'empty all'
        document.getElementById(boardRepresentation[opponentPieceLocation.row][opponentPieceLocation.column]).id = 'e' + emptySlotNumber
        boardRepresentation[opponentPieceLocation.row][opponentPieceLocation.column] = 'e' + emptySlotNumber++
        opponentPiecesOnKingsPath = 0
        teamPiecesOnKingsPath = 0
        isFirstTimeOpponentPieceLocation = true
        isFirstCapture = true 
        movesCount = 0
        addScoreBoardPiece(isWhiteTurn)
        return true
    } else if (!isKingMustCapture && opponentPiecesOnKingsPath === 0 && teamPiecesOnKingsPath === 0){
        opponentPiecesOnKingsPath = 0
        teamPiecesOnKingsPath = 0
        return true
    }
    opponentPiecesOnKingsPath = 0
    teamPiecesOnKingsPath = 0
    isFirstTimeOpponentPieceLocation = true
    isKingMustCapture = false
    return false
}
function KingMoveingUpLeft (move, boardRepresentation, isWhiteTurn){
    for (let x = move.from.row - 1, y = move.from.column - 1; x >= move.to.row && y >= move.to.column; x--, y--){
        opponentPiecesOnKingsPath =  boardRepresentation[x][y].includes(isWhiteTurn?'b':'w') ? ++opponentPiecesOnKingsPath : opponentPiecesOnKingsPath
        teamPiecesOnKingsPath =  boardRepresentation[x][y].includes(isWhiteTurn?'w':'b') ? ++teamPiecesOnKingsPath : teamPiecesOnKingsPath 
        if (teamPiecesOnKingsPath === 1)
            break
        if (opponentPiecesOnKingsPath === 1 && isFirstTimeOpponentPieceLocation){
            opponentPieceLocation = new Location (x,y)
            isFirstTimeOpponentPieceLocation = false
        }
    }
}
function KingMoveingUpRight (move, boardRepresentation, isWhiteTurn){
    for (let x = move.from.row - 1, y = move.from.column + 1; x >= move.to.row && y <= move.to.column; x--, y++){
        opponentPiecesOnKingsPath =  boardRepresentation[x][y].includes(isWhiteTurn?'b':'w') ? ++opponentPiecesOnKingsPath : opponentPiecesOnKingsPath
        teamPiecesOnKingsPath =  boardRepresentation[x][y].includes(isWhiteTurn?'w':'b') ? ++teamPiecesOnKingsPath : teamPiecesOnKingsPath 
        if (teamPiecesOnKingsPath === 1)
            break
        if (opponentPiecesOnKingsPath === 1 && isFirstTimeOpponentPieceLocation){
            opponentPieceLocation = new Location (x,y)
            isFirstTimeOpponentPieceLocation = false
        }
    }
}
function KingMoveingDownLeft (move, boardRepresentation, isWhiteTurn){
    for (let x = move.from.row + 1, y = move.from.column - 1; x <= move.to.row && y >= move.to.column; x++, y--){
        opponentPiecesOnKingsPath =  boardRepresentation[x][y].includes(isWhiteTurn?'b':'w') ? ++opponentPiecesOnKingsPath : opponentPiecesOnKingsPath
        teamPiecesOnKingsPath =  boardRepresentation[x][y].includes(isWhiteTurn?'w':'b') ? ++teamPiecesOnKingsPath : teamPiecesOnKingsPath 
        if (teamPiecesOnKingsPath === 1)
            break
        if (opponentPiecesOnKingsPath === 1 && isFirstTimeOpponentPieceLocation){
            opponentPieceLocation = new Location (x,y)
            isFirstTimeOpponentPieceLocation = false
        }
    }
}
function KingMoveingDownRight (move, boardRepresentation, isWhiteTurn){
    for (let x = move.from.row + 1, y = move.from.column + 1; x <= move.to.row && y <= move.to.column; x++, y++){
        opponentPiecesOnKingsPath =  boardRepresentation[x][y].includes(isWhiteTurn?'b':'w') ? ++opponentPiecesOnKingsPath : opponentPiecesOnKingsPath
        teamPiecesOnKingsPath =  boardRepresentation[x][y].includes(isWhiteTurn?'w':'b') ? ++teamPiecesOnKingsPath : teamPiecesOnKingsPath 
        if (teamPiecesOnKingsPath === 1)
            break
        if (opponentPiecesOnKingsPath === 1 && isFirstTimeOpponentPieceLocation){
            opponentPieceLocation = new Location (x,y)
            isFirstTimeOpponentPieceLocation = false
        }
    }
}
function isMustCpatureSelcet (selectedPiece, boardRepresentation, isWhiteTurn){
    for (let i=0; i<8; i++){
        if (boardRepresentation[i].indexOf(selectedPiece) !== -1){
            var location = new Location(i,boardRepresentation[i].indexOf(selectedPiece))
            break
        } 
    }
    if (isWhiteTurn){
        //Up Left
        if (location.row-2<8 && location.row-2>=0 && location.column-2<8 && location.column-2>=0 && boardRepresentation[location.row-1][location.column-1].includes('b') && boardRepresentation[location.row-2][location.column-2].includes('e'))
            return true
        //Up Right
        else if (location.row-2<8 && location.row-2>=0 && location.column+2<8 && location.column+2>=0 && boardRepresentation[location.row-1][location.column+1].includes('b') && boardRepresentation[location.row-2][location.column+2].includes('e'))
            return true
    } else {
        //Down Left
        if (location.row+2<8 && location.row+2>=0 && location.column-2<8 && location.column-2>=0 && boardRepresentation[location.row+1][location.column-1].includes('w') && boardRepresentation[location.row+2][location.column-2].includes('e'))
            return true
        //Up Right
        else if (location.row+2<8 && location.row+2>=0 && location.column+2<8 && location.column+2>=0 && boardRepresentation[location.row+1][location.column+1].includes('w') && boardRepresentation[location.row+2][location.column+2].includes('e'))
            return true
    }
    return false
}
function isMustCapturePostMove (boardRepresentation, isWhiteTurn){
    for (let row=0; row<8; row++){
        for (let column=0; column<8; column++){
                if (boardRepresentation[row][column] === undefined || boardRepresentation[row][column].includes('e'))
                    continue
                 if (boardRepresentation[row][column].includes('b')){
                    var location = new Location(row, column)
                    if (!(location.row-1<8 && location.row+1<8 && location.column-1<8 && location.column+1<8 && location.row-1>=0 && location.row+1>=0 && location.column-1>=0 && location.column+1>=0))
                    continue
                    //Down Left
                    if (isWhiteTurn && boardRepresentation[location.row+1][location.column-1].includes('w') && boardRepresentation[location.row-1][location.column+1].includes('e')){
                        document.getElementById(boardRepresentation[row+1][column-1]).classList.add('select-ring')
                        mustCapturePiece = boardRepresentation[row+1][column-1]
                        return true
                    //Down Right    
                    } else if (isWhiteTurn && boardRepresentation[location.row+1][location.column+1].includes('w') && boardRepresentation[location.row-1][location.column-1].includes('e')){
                        document.getElementById(boardRepresentation[row+1][column+1]).classList.add('select-ring')
                        mustCapturePiece = boardRepresentation[row+1][column+1]
                        return true
                    }
                } else {
                    var location = new Location(row, column)
                    if (!(location.row-1<8 && location.row+1<8 && location.column-1<8 && location.column+1<8 && location.row-1>=0 && location.row+1>=0 && location.column-1>=0 && location.column+1>=0))
                    continue
                    //Up Left
                    if (!isWhiteTurn && boardRepresentation[location.row-1][location.column-1].includes('b') && boardRepresentation[location.row+1][location.column+1].includes('e')){
                        document.getElementById(boardRepresentation[row-1][column-1]).classList.add('select-ring')
                        mustCapturePiece = boardRepresentation[row-1][column-1]
                        return true
                    //Up Right    
                    } else if (!isWhiteTurn && boardRepresentation[location.row-1][location.column+1].includes('b') && boardRepresentation[location.row+1][location.column-1].includes('e')){
                        document.getElementById(boardRepresentation[row-1][column+1]).classList.add('select-ring')
                        mustCapturePiece = boardRepresentation[row-1][column+1]
                        return true
                    }
                }   
        }
    }
    return false
}
function isKingMustCaptureing (move, boardRepresentation, isWhiteTurn){
    for (let row=0; row<8; row++){
        for (let column=0; column<8; column++){
            if (boardRepresentation[row][column] === undefined)
                continue
            if (boardRepresentation[row][column].includes(isWhiteTurn ? 'wk' : 'bk' )){
                var num = 0
                while (num<=3){
                    switch(num){
                        case 0: var move = new Move(new Location(row,column),new Location(0,0));
                                KingMoveingUpLeft(move, boardRepresentation, isWhiteTurn); num++;
                                if (opponentPieceLocation !== undefined && opponentPiecesOnKingsPath >=1 && opponentPieceLocation.row-1>=0 && opponentPieceLocation.column-1>=0 && boardRepresentation[opponentPieceLocation.row-1][opponentPieceLocation.column-1].includes('e')){
                                    num = 4;
                                } else { opponentPiecesOnKingsPath = 0; teamPiecesOnKingsPath = 0; isFirstTimeOpponentPieceLocation = true }; break
                        case 1: var move = new Move(new Location(row,column),new Location(0,7));
                                KingMoveingUpRight(move, boardRepresentation, isWhiteTurn); num++;
                                if (opponentPieceLocation !== undefined && opponentPiecesOnKingsPath >=1 &&  opponentPieceLocation.row-1>=0 && opponentPieceLocation.column+1<8 && boardRepresentation[opponentPieceLocation.row-1][opponentPieceLocation.column+1].includes('e')){
                                    num = 4;
                                } else { opponentPiecesOnKingsPath = 0; teamPiecesOnKingsPath = 0; isFirstTimeOpponentPieceLocation = true }; break
                        case 2: var move = new Move(new Location(row,column),new Location(7,0));
                                KingMoveingDownLeft(move, boardRepresentation, isWhiteTurn); num++;
                                if (opponentPieceLocation !== undefined && opponentPiecesOnKingsPath >=1 &&  opponentPieceLocation.row+1<8 && opponentPieceLocation.column-1>=0 && boardRepresentation[opponentPieceLocation.row+1][opponentPieceLocation.column-1].includes('e')){
                                    num = 4;
                                } else { opponentPiecesOnKingsPath = 0; teamPiecesOnKingsPath = 0; isFirstTimeOpponentPieceLocation = true }; break
                        case 3: var move = new Move(new Location(row,column),new Location(7,7));
                                KingMoveingDownRight(move, boardRepresentation, isWhiteTurn); num++;
                                if (opponentPieceLocation !== undefined && opponentPiecesOnKingsPath >=1 &&  opponentPieceLocation.row+1<8 && opponentPieceLocation.column+1<8 && boardRepresentation[opponentPieceLocation.row+1][opponentPieceLocation.column+1].includes('e')){
                                    num = 4;
                                } else { opponentPiecesOnKingsPath = 0; teamPiecesOnKingsPath = 0; isFirstTimeOpponentPieceLocation = true }; break
                    }
                    if (opponentPieceLocation !== undefined && opponentPiecesOnKingsPath >=1 && teamPiecesOnKingsPath <= 1){
                        for (let pieceSelectRemove of allSlots)
                            pieceSelectRemove.classList.remove('select-ring')
                        document.getElementById(boardRepresentation[move.from.row][move.from.column]).classList.add('select-ring')
                        mustCapturePiece = boardRepresentation[move.from.row][move.from.column]
                        opponentPiecesOnKingsPath = 0
                        teamPiecesOnKingsPath = 0 
                        isFirstTimeOpponentPieceLocation = true
                        isKingMustCapture = true 
                        return true
                    }
                }
            }
        }
    }
    isKingMustCapture = false
    return false
}
function isGameOver(boardRepresentation){
    var whitePieces = 0 , blackPieces = 0 , whiteKings = 0 , blackKings = 0
    for (let row=0; row<8; row++){
        for (let column=0; column<8; column++){
            if(boardRepresentation[row][column] === undefined)
                continue
            if (boardRepresentation[row][column].includes('wk')){
                whiteKings++
            } else if (boardRepresentation[row][column].includes('bk')){
                blackKings++
            } else if (boardRepresentation[row][column].includes('w') && !(boardRepresentation[row][column].includes('k')) && (row-1<8 && row-1>=0 && (column-1<8 && column-1>=0 && boardRepresentation[row-1][column-1].includes('e') || column+1<8 && column+1>=0 && boardRepresentation[row-1][column+1].includes('e')))){
                whitePieces++
            } else if (boardRepresentation[row][column].includes('b') && !(boardRepresentation[row][column].includes('k')) && (row+1<8 && row+1>=0 && (column-1<8 && column-1>=0 && boardRepresentation[row+1][column-1].includes('e') || column+1<8 && column+1>=0 && boardRepresentation[row+1][column+1].includes('e')))){
                blackPieces++
            }
        }
    }
    if (whitePieces === 0 && whiteKings === 0){ 
        gameOverMessage.innerHTML = 'Black Player WIN'
        gameOverMessage.style = 'color: black'
        modal.className = 'modal'
    } else if (blackPieces === 0 && blackKings === 0){
        gameOverMessage.innerHTML = 'White Player WIN'
        gameOverMessage.style = 'color: white'
        modal.className = 'modal'
    }
    if (whitePieces === 0 && blackPieces === 0 && ((whiteKings === 1 && blackKings <= 2) || (whiteKings <= 2 && blackKings === 1))){
        gameOverMessage.innerHTML = 'Draw By Not Enough Pieces'
        gameOverMessage.style = 'margin-top: -10px'
        modal.className = 'modal'
    }
    if (movesCount === 15){ 
        gameOverMessage.innerHTML = 'Draw By 15 Moves'
        modal.className = 'modal'   
    }
}

for (let slot of allSlots){   // Piece Movement
    slot.addEventListener('click',()=>{
        if (slot.className.includes('piece')){
            if (slot.className !== 'empty' && (isWhiteTurn ? slot.className.includes('white') : slot.className.includes('black')) && isLegalSelect(slot.id, boardRepresentation, isWhiteTurn)){
                selectedPiece = slot.id
                if (!isMustCapture){
                    for (let pieceSelectRemove of allSlots)
                        pieceSelectRemove.classList.remove('select-ring')
                    slot.classList.add('select-ring')
                } else if (isMustCpatureSelcet(selectedPiece ,boardRepresentation, isWhiteTurn)){
                    for (let pieceSelectRemove of allSlots)
                        pieceSelectRemove.classList.remove('select-ring')
                    document.getElementById(selectedPiece).classList.add('select-ring')
                    mustCapturePiece = selectedPiece
                }
            }
        } else {
            selectedPiece = !isMustCapture ? selectedPiece : mustCapturePiece 
            if (document.getElementsByClassName('select-ring').length === 1 && slot.className.includes('empty') && (isWhiteTurn ? selectedPiece.includes('w') : selectedPiece.includes('b'))){
                selectedSlot = slot.id 
                if (isLegalMove(selectedPiece, selectedSlot, boardRepresentation, isWhiteTurn)){
                    if (isKingPromoted || selectedPiece.includes('k'))
                        slot.className = isWhiteTurn ? 'piece white white-king all' : 'piece black black-king all'
                    else
                        slot.className = isWhiteTurn ? 'piece white all' : 'piece black all'
                    document.getElementById(selectedPiece).className = 'empty all'
                    document.getElementById(selectedPiece).id = slot.id
                    if (isKingPromoted){
                        slot.id = promototedKingId
                        isKingPromoted = false
                    }else
                        slot.id = selectedPiece
                    if (!isFirstCapture){
                        isWhiteTurn = !isWhiteTurn
                        isFirstCapture = false
                        playerTurnDisplay(isWhiteTurn)
                    } 
                    isMustCapture = isMustCapturePostMove(boardRepresentation, isWhiteTurn) || isKingMustCaptureing(move, boardRepresentation, isWhiteTurn)  || (isFirstCapture && canCaptureBackwards(move, boardRepresentation, isWhiteTurn))
                    movesCount++
                    isGameOver(boardRepresentation)
                }
            }
        }
    })
}