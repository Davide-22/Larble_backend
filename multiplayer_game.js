class MultiplayerGame {
    
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;

    }

    getPlayer1(){
        return this.player1;
    }

    getPlayer2(){
        return this.player2;
    }

    setPlayer1(player){
        this.player1 = player;
    }

    setPlayer2(player){
        this.player2 = player;
    }


    setPlayer1Position(x,y){
        this.x1 = x;
        this.y1 = y;
    }

    setPlayer2Position(x,y){
        this.x2 = x;
        this.y2 = y;
    }

}

module.exports = {
    MultiplayerGame
}