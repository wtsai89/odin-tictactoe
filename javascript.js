function Gameboard() {
    const rows = 3;
    const cols = 3;
    const board = [];

    for(let i = 0; i < rows; i++) {
        board[i] = []
        for(let j = 0; j < cols; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const placeToken = (row, col, player) => {
        if (board[row][col].getValue() === 0) {
            board[row][col].addToken(player);
            return 0;
        }
        return -1;
    }

    const printBoard = () => {
        const printout = board.map((row) => row.map((cell) => cell.getValue()));
        console.log(printout);
    }

    const resetBoard = () => {
        for(let i = 0; i < rows; i++) {
            for(let j = 0; j < cols; j++) {
                board[i][j].addToken(0);
            }
        }
    }

    return {getBoard, placeToken, printBoard, resetBoard};
}

function Cell() {
    let value = 0;

    const addToken = (player) => {
        value = player;
    };

    const getValue = () => value;

    return {
        addToken,
        getValue
    };
}

function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
) {
    const board = Gameboard();

    const players = [
        {
            name: playerOneName,
            token: 1
        },
        {
            name: playerTwoName,
            token: 2
        }
    ];

    let activePlayer = players[0];

    const updatePlayerNames = () => {
        const playerOne = document.querySelector("#player1");
        const playerTwo = document.querySelector("#player2");
        players[0].name = playerOne.value || "Player One";
        players[1].name = playerTwo.value || "Player Two";
    }

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn`)
    };

    const checkWin = (row, col) => {
        const player = getActivePlayer().token;
        const boardArray = board.getBoard();
        const triple = [player, player, player];
        
        const rowCheck = [boardArray[row][0].getValue(), boardArray[row][1].getValue(), boardArray[row][2].getValue()];
        if ( JSON.stringify(rowCheck) === JSON.stringify(triple))
            return true;

        const colCheck = [boardArray[0][col].getValue(), boardArray[1][col].getValue(), boardArray[2][col].getValue()];
        if ( JSON.stringify(colCheck) === JSON.stringify(triple))
            return true;

        const diag1Check = [boardArray[0][0].getValue(), boardArray[1][1].getValue(), boardArray[2][2].getValue()];
        if ( JSON.stringify(diag1Check) === JSON.stringify(triple))
            return true;

        const diag2Check = [boardArray[0][2].getValue(), boardArray[1][1].getValue(), boardArray[2][0].getValue()];
        if ( JSON.stringify(diag2Check) === JSON.stringify(triple))
            return true;

        return false;
    }

    const playRound = (row, col) => {
        console.log(`Placing ${getActivePlayer().name}'s token on Row ${row} Column ${col}`);
        const placeResult = board.placeToken(row,col,getActivePlayer().token);

        if ( placeResult === -1) {
            console.log(`Row ${row} Column ${col} is already occupied`);
        }
        else {
            if (checkWin(row, col)){
                console.log(`${getActivePlayer().name} Wins!`);
                board.printBoard();
                return 1;
            }
            switchPlayerTurn();
        }
        printNewRound();
        return 0;
    };

    const reset = () => {
        board.resetBoard();
        activePlayer = players[0];
    }

    printNewRound();

    return { getActivePlayer, playRound, updatePlayerNames, getBoard: board.getBoard, reset};
}

function ScreenController() {
    const game = GameController();
    const promptDiv = document.querySelector(".playerPrompt");
    const boardDiv = document.querySelector(".tttgrid");
    let active = false;

    const updateScreen = () => {
        const board = game.getBoard();
        const printout = board.map((row) => row.map((cell) => cell.getValue()));
        const activePlayer = game.getActivePlayer();

        promptDiv.textContent = `${activePlayer.name}'s turn`;

        for (const div of boardDiv.children) {
            for (const button of div.children) {
                const buttonRow = button.dataset.row;
                const buttonCol = button.dataset.col;
                const cellValue = printout[buttonRow][buttonCol];
                if (cellValue === 0)
                    button.style.background = "none";
                else if (cellValue === 1)
                    button.style.backgroundImage = "url(./x.svg)";
                else
                    button.style.backgroundImage = "url(./circle-outline.svg)";
                button.style.backgroundSize = "cover";
            }
        }
    }

    function clickHandlerBoard(e) {
        const selectedRow = e.target.dataset.row;
        const selectedCol = e.target.dataset.col;

        if (!selectedRow || !active) return;

        result = game.playRound(selectedRow, selectedCol);
        updateScreen();

        if (result === 1) {
            promptDiv.textContent = `${game.getActivePlayer().name} Wins!`;
            active = false;
        }

        //console.log(`Row ${selectedRow} Col ${selectedCol}`);
    }
    boardDiv.addEventListener("click", clickHandlerBoard);

    function toggleActive() {
        game.reset();
        game.updatePlayerNames();
        updateScreen();
        active = true;
        console.log(active);
    }

    return { toggleActive } ;
}

const game = ScreenController();

const dialog = document.querySelector("dialog");
const newGameButton = document.querySelector(".newGame");
newGameButton.addEventListener("click", () => {
    dialog.showModal();
})
const submitButton = document.querySelector("form button");
submitButton.addEventListener("click", (e) => {
    game.toggleActive();
    dialog.close();
    e.preventDefault();
})