export default class Progress {

    constructor() {

        this.bar = null;
        this.index = 0;
        this.imgList = [];

    }
    
    init(){

        this.box = document.getElementById("progressBox");
        this.prog = document.createElement("progress");
      
    }

    loadImages( paths ) {

        let i, length = paths.length;

        this.bar.max = length;

        for ( i = 0 ; i < length; i++){

            var img = new Image();

            img.onload = () => {
                this.increase();
                if (this.index >= length){
                    this.done();
                }
            };

            img.src = paths[i];

            this.imgList.push(img);


        }
    }

    increase(){

        this.index++;

        this.bar.value = this.index;

    }

    done() {

        console.log("I am done loading");

    }

};