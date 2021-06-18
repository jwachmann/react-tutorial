import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

import Board from "./board.js";

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      history: [
        {
          squares: [null, null, null, null, null, null, null, null, null],
          lastMove: null
        },
      ],
      selected: null,
      stepNumber: 1,
      isXNext: true,
      winner: null,
    };
  }

  calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[b] === squares[c]
      ) {
        return squares[a];
      }
    }

    return null;
  }

  getNextPlayer() {
    return this.state.isXNext ? "X" : "O";
  }

  getDescription(index) {
    return index > 0 ? "Go to move #" + index : "Go to game start";
  }

  jumpTo(step) {
    const current = this.state.history[step - 1]
    const winner = this.calculateWinner(current.squares);

    this.setState({
      stepNumber: step,
      selected: current.lastMove,
      isXNext: (step % 2) === 1,
      winner: winner,
    })
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber);
    const current = history[this.state.stepNumber - 1];

    if (this.state.winner || current.squares[i] !== null) {
      this.setState({
        selected: i,
      });
      return;
    }

    const squares = current.squares.slice();
    squares[i] = this.getNextPlayer();

    const winner = this.calculateWinner(squares);

    this.setState({
      history: history.concat([
        {
          squares: squares,
          lastMove: i,
        },
      ]),
      selected: i,
      stepNumber: history.length + 1,
      isXNext: !this.state.isXNext,
      winner: winner,
    });
  }

  getLastMoveDescription(historyItem) {
    if (historyItem.lastMove === null) {
      return null;
    }

    let column, row = 0;

    switch (historyItem.lastMove % 3) {
      case 0:
        column = 1;
        break;
      case 1:
        column = 2;
        break;
      case 2:
        column = 3;
        break;
    }

    if (historyItem.lastMove < 3) {
      row = 1;
    } else if (historyItem.lastMove < 6) {
      row = 2;
    } else {
      row = 3;
    }

    return `(${column}, ${row})`;
  }

  callServer() {
    const promise = new Promise((resolve, reject) => {
      const request = fetch("http://localhost:8000")
      request.then(response => response.text())
        .then(text => resolve(text))
        .catch(reason => reject(reason));
    });
    
    return promise;
  }

  getServerResponse() {
    const promise = this.callServer();
    promise.then(content => {
      this.setState({serverMessage: content});
    })
    .catch(error => {
      this.setState({serverMessage: `Server call failed: ${error}`});
    });
  }

  render() {
    const status =
      this.state.winner === null
        ? "Next player: " + this.getNextPlayer()
        : "Winner: " + this.state.winner;

    const greeting =
      this.state.serverMessage
        ? <div>{this.state.serverMessage}</div>
        : null;

    return (
      <div>
        <h1>Hello World!</h1>
        <button onClick={() => this.getServerResponse()}>Click me to call the server</button>
        {greeting}

        <div className="game">
          <div className="game-board">
            <Board
              squares={
                this.state.history[this.state.stepNumber - 1].squares
              }
              selected={this.state.selected}
              isXNext={this.state.isXNext}
              winner={this.state.winner}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <ol>
              {this.state.history.map((item, index) => {
                return (
                  <li key={index}>
                    <button onClick={() => this.jumpTo(index + 1)}>
                      {this.getDescription(index)}
                    </button>
                    <span className={this.state.stepNumber === index + 1 ? "step-number selected" : "step-number"}>
                      {this.getLastMoveDescription(item)}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
