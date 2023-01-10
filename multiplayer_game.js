class MultiplayerGame {
    
    constructor(player1, labyrinth) {
        this.player1 = player1;
        this.player2 = null;
        this.usernamePlayer2 = null;
        this.lastAccess = Date.now();
        this.labyrinth = labyrinth;
        this.x1 = 0.49026123;
        this.y1 = 0.7898653;
        this.x2 = 0.49026123;
        this.y2 = 0.7898653;
        this.isPlayer1Win = false;
        this.isPlayer2Win = false;
    }

    getPlayer1(){
        return this.player1;
    }

    getPlayer2(){
        return this.player2;
    }

    getLastAccess(){
        return this.lastAccess;
    }

    getPlayer1Coord(){
        return {x : this.x1, y: this.y1};
    }

    getPlayer2Coord(){
        return {x: this.x2, y : this.y2}  ;  
    }

    getLabyrinth(){
        return this.labyrinth;
    }

    setUsernamePlayer2(usernamePlayer2){
        this.usernamePlayer2 = usernamePlayer2;
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

    setLastAcces(){
        this.lastAccess = Date.now();
    }

    player1Win(){
        this.isPlayer1Win = true;
    }

    player2Win(){
        this.isPlayer2Win = true;
    }
}

module.exports = {
    MultiplayerGame
}
