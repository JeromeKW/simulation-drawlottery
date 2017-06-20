//模拟摇奖
function canvasDrawLottery(config){
    if(!config){
        config = {};
    }
    var self = this;
    var rem = 1;
    if(screen.width < 375){
        rem = screen.width / 375;
    }
    //摇奖区域（一个圆的范围内）
    var CIRCLE_X = 190 * rem,
        CIRCLE_Y = 190 * rem,
        CIRCLE_R = 90 * rem;

    //号码列表
    var balls = [];
    var resBallsCount = 0;

    //区域限定
    var maxX = CIRCLE_X + CIRCLE_R,
        maxY = CIRCLE_Y + CIRCLE_R,
        minX = CIRCLE_X - CIRCLE_R,
        minY = CIRCLE_Y - CIRCLE_R,
        r = 12 * rem,
        maxNum = config.ballNum || 16;

    //结果球
    var rollX = 0;
    var resBall = {};

    //定时器
    this.time = null;
    this.resTime = null;
    var prizing = false;
    var rolling = false;
    var execSpecialTimes = 0;

    //图像对象
    var bgImage = '';
    var logoImage = {'ssq': '', 'qlc': '', '3d': ''};

    //已开出来的球
    var resBallStore = [];

    //画布
    var canvas = document.getElementById('canvas');
    canvas.width = Math.min(screen.width, 375);
    document.getElementById('canvas_wrap').style.width = canvas.width + 'px';
    if(screen.width < 375){
        canvas.height = 488 * rem;
    }else{
        canvas.height = 488;
    }
    this.cxt = canvas.getContext('2d');

    self.drawing = false;
    //号码、号码总数、颜色、彩种
    this.special = config.special || '';
    self.numList = config.numList || ['01', '02', '03'];
    self.totalNum = config.totalNum || 3;
    self.color = config.color || ['#ff1100', '#751116'];
    self.lotteryType = config.lotteryType || 'ssq';

    //单击事件
    canvas.addEventListener('click', function(e){
        var pos = self.getEventPosition(e);
        if(pos.x > 186*rem - 26*rem*2 && pos.x<186 * rem + 26*rem*2 &&
           pos.y > 460*rem-8*rem && pos.y < 460*rem+8*rem){
            if(!self.drawing){
                self.drawing = true;
                execSpecialTimes = 0;
                changeLottery(self.lotteryType);
                self.draw();
            }
        }
    }, false);

    //获取点击的坐标
    this.getEventPosition = function(ev){
        var x, y;
        if(ev.layerX || ev.layerX == 0) {
            x = ev.layerX;
            y = ev.layerY;
        }else if(ev.offsetX || ev.offsetX == 0){
            x = ev.offsetX;
            y = ev.offsetY;
        }
        return {x: x, y: y};
    }

    //生成号码球
    this.getBallsList = function(){
        balls = [];
        for(var i=0; i<maxNum; i++) {
            var ball = {
                x : self.getRandomNumber(minX + r, maxX - r),
                y : self.getRandomNumber(minY + r, maxY - r),
                r : r,
                vx : self.getRandomNumber(2 * rem, 2.5 * rem),
                vy : self.getRandomNumber(2 * rem, 2.5 * rem)
            };
            balls.push(ball);
        }
    };

    //绘制开始
    this.draw = function(){
        $('#select_lottery_box').hide();
        rolling = true;
        resBallStore = [];
        rollX = 0;
        resBallsCount = 0;
        self.getBallsList();
        self.time = setInterval(function(){
            self.drawBalls();
            self.updateBallsXY();
        }, 9);
        setTimeout(function(){
            self.showResult();
        }, 3000);
    };

    //画背景
    this.drawBackground = function(){
        self.cxt.clearRect(0, 0, self.cxt.canvas.width, self.cxt.canvas.height);
        if(bgImage){
            self.cxt.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
            self.drawLogo();
            self.drawBeginBtn();
        }else{
            var image = new Image();
            image.src = './img/drawlott_bg.png';
            image.onload = function(){
                bgImage = image;
                self.cxt.drawImage(image, 0, 0, canvas.width, canvas.height);
                self.drawLogo();
                self.drawBeginBtn();
            }
        }
    };

    //画Logo
    this.drawLogo = function(){
        if(logoImage[self.lotteryType]){
            self.cxt.drawImage(logoImage[self.lotteryType], 155*rem, 347*rem, 65 * rem * 0.9, 65 * rem * 0.9);
        }else{
            var image = new Image();
            image.src = './img/'+ self.lotteryType +'_logo.png';
            image.onload = function(){
                logoImage[self.lotteryType] = image;
                self.cxt.drawImage(image, 155*rem, 347*rem, 65 * rem * 0.9, 65 * rem * 0.9);
            }
        }
    };

    //开始按钮
    this.drawBeginBtn = function(){
        self.cxt.beginPath();
        self.cxt.font = 26 * rem + 'px Arial';
        self.cxt.textAlign = 'center';
        self.cxt.textBaseline = 'middle';
        self.cxt.fillStyle = '#fff193';
        var txt = '开始摇号';
        if(rolling){
            self.cxt.font = 18 * rem + 'px Arial';
            txt = '自动摇号中';
        }
        self.cxt.fillText(txt, 186 * rem, 460 * rem);
    };

    //号码球的绘制
    this.drawBalls = function(){
        self.drawBackground();
        for(var i=0, len=balls.length; i<len; i++){
            self.cxt.beginPath();
            self.cxt.arc(balls[i].x, balls[i].y, r, 0, 2*Math.PI);
            var radial = self.cxt.createRadialGradient(balls[i].x - balls[i].r/2, balls[i].y - r/2, 1, balls[i].x, balls[i].y, r + 15 * rem);
            radial.addColorStop(0, self.color[0]);
            radial.addColorStop(1, self.color[1]);
            self.cxt.fillStyle = radial;
            self.cxt.closePath();
            self.cxt.fill();
        }

        if(prizing){
            self.cxt.beginPath();
            self.cxt.arc(resBall.x, resBall.y, resBall.r, 0, 2*Math.PI);
            var radial = self.cxt.createRadialGradient(resBall.x - resBall.r/2, resBall.y - resBall.r/2, 1, resBall.x, resBall.y, resBall.r + 15 * rem);
            radial.addColorStop(0, self.color[0]);
            radial.addColorStop(1, self.color[1]);
            self.cxt.fillStyle = radial;
            self.cxt.fill();
            self.cxt.closePath();
            self.cxt.font = 'bold 12px Arial';
            self.cxt.textAlign = 'center';
            self.cxt.textBaseline = 'middle';
            self.cxt.fillStyle = '#fff';
            self.cxt.fillText(self.numList[resBallsCount], resBall.x, resBall.y);
        }

        self.drawPrizeNum();
    };

    //更新摇奖球的坐标
    this.updateBallsXY = function(){
        for(var i=0, len=balls.length; i<len; i++){
            balls[i].x += balls[i].vx;
            balls[i].y += balls[i].vy;
            
            if(balls[i].x >= maxX - balls[i].r){
                balls[i].x = maxX - balls[i].r;
                balls[i].vx = -balls[i].vx;
            }
            if(balls[i].x <= minX + balls[i].r){
                balls[i].x = minX + balls[i].r;
                balls[i].vx = -balls[i].vx;
            }
            if(balls[i].y >= maxY - balls[i].r){
                balls[i].y = maxY - balls[i].r;
                balls[i].vy = -balls[i].vy;
            }
            if(balls[i].y <= minY + balls[i].r){
                balls[i].y = minY + balls[i].r;
                balls[i].vy =  - balls[i].vy;
            }

            //碰撞检测
            /*for(var j=0; j<balls.length; j++){
                if(j !== i){
                    if(Math.round(Math.pow(balls[i].x - balls[j].x, 2) + Math.pow(balls[i].y - balls[j].y, 2)) <=
                        Math.round(Math.pow(balls[i].r * 2, 2))) {

                        var tempX = balls[i].vx;
                        var tempY = balls[i].vy;
                        balls[i].vx = balls[j].vx;
                        balls[j].vx = tempX;
                        balls[i].vy = balls[j].vy;
                        balls[j].vy = tempY;
                    }
                }
            }*/
        }
    };

    //显示开奖结果
    this.showResult = function(){
        prizing = true;
        rollX = 0;
        rollY = 0;
        resBall = {
            x: 217 * rem, 
            y: 280 * rem, 
            r: 10 * rem, 
            vx : 1.2 * rem, 
            vy : 2.4 * rem
        };
        self.resTime = setInterval(function(){
            self.updateResultXY();
        }, 15);
    };

    //更新结果球坐标
    this.updateResultXY = function(){
        resBall.x += resBall.vx;
        resBall.y += resBall.vy;
        rollX += resBall.vx;
        rollY += resBall.vy;
        if(rollX > 20 * rem){
            resBall.vy = 0;
            if(resBallsCount < 6){
                resBall.vx = -2 * rem;
            }else{
                resBall.vx = 2 * rem;
            }
        }
        if((rollX < -98 * rem + resBallsCount * resBall.r * 2 && rollY > 30 * rem && resBallsCount < 6) || 
            (resBallsCount >= 6 && rollX > (resBallsCount - 5) * resBall.r * 2)){
            prizing = false;
            clearInterval(self.resTime);
            resBallsCount += 1;
            var resY = resBall.y;
            if(resBallsCount > 3 && resBallsCount <= 6){
                resY = resBall.y + 1.2 * rem;
            }
            resBallStore.push({x: resBall.x, y: resY, r: resBall.r, num: self.numList[resBallsCount-1]});
            if(resBallsCount < self.totalNum){
                setTimeout(function(){
                    self.showResult();
                }, 3000);
            }else{
                clearInterval(self.time);
                if(execSpecialTimes < self.special.length){
                    setTimeout(function(){
                        self.color = self.special[execSpecialTimes].color;
                        self.totalNum = self.special[execSpecialTimes].totalNum;
                        self.numList = self.special[execSpecialTimes].numList;
                        self.draw();
                        execSpecialTimes++;
                    }, 3000);
                }else{
                    self.drawing = false;
                    rolling = false;
                    $('#select_lottery_box').show();
                    $('#show_result_layer').show();
                }
                self.drawBackground();
                self.drawPrizeNum();
            }
        }
    };

    //绘制开奖号码
    this.drawPrizeNum = function(){
        if(resBallStore.length){
            for(var i=0, len=resBallStore.length; i<len; i++){
                self.cxt.beginPath();
                self.cxt.arc(resBallStore[i].x, resBallStore[i].y, resBallStore[i].r, 0, 2*Math.PI);
                var radial = self.cxt.createRadialGradient(resBallStore[i].x - resBallStore[i].r/2, resBallStore[i].y - resBallStore[i].r/2, 1, resBallStore[i].x, resBallStore[i].y, resBallStore[i].r + 15 * rem);
                radial.addColorStop(0, self.color[0]);
                radial.addColorStop(1, self.color[1]);
                self.cxt.fillStyle = radial;
                self.cxt.fill();
                self.cxt.closePath();
                self.cxt.font = 'bold 12px Arial';
                self.cxt.textAlign = 'center';
                self.cxt.textBaseline = 'middle';
                self.cxt.fillStyle = '#fff';
                self.cxt.fillText(self.numList[i], resBallStore[i].x, resBallStore[i].y);
            }
        }
    };

    //生成随机数
    this.getRandomNumber = function(min, max) {
        return (min + Math.floor(Math.random() * (max - min + 1)));
    };

    this.drawBackground();
    // this.draw();
}