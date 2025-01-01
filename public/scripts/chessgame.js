const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let squarePiece = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowIndex) => {

        row.forEach((square, squareIndex) => {

            const squareElement = document.createElement("div");
            squareElement.classList.add("square", (rowIndex + squareIndex) % 2 == 0 ? "light" : "dark");
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");
                pieceElement.innerHTML = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSquare =
                    {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };

                    handleMove(sourceSquare, targetSquare);
                }
            });
            boardElement.appendChild(squareElement);
        });
    });

    if(playerRole=="b"){
        boardElement.classList.add("flipped");
    } else{
        boardElement.classList.remove("flipped");
    }
};


const handleMove = (source,target) => { 
    const move={
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`, 
        to:`${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion:'q'
    };
    socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
      p: "\u2659", // white pawn
      r: "\u2656", // white rook
      n: "\u2658", // white knight
      b: "\u2657", // white bishop
      q: "\u2655", // white queen
      k: "\u2654", // white king
      P: "\u265F", // black pawn
      R: "\u265C", // black rook
      N: "\u265E", // black knight
      B: "\u265D", // black bishop
      Q: "\u265B", // black queen
      K: "\u265A", // black king
    };
    return unicodePieces[piece.type] || "";
  };

socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", () => {
    playerRole = null;
    renderBoard();
});

socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("move", (move) => {
    chess.load(move);
    renderBoard();
});

renderBoard();

