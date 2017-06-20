var drawLottery = null;
var resultStore = [];
var addPrefix = true;
var numListStr = '';
$(function(){
    $('body').css('background', '#ff5c02');
    drawLottery = new canvasDrawLottery();
    // changeLottery('ssq');

    //选彩种
    var showDownLottery = $('#showdown_lottery'),
        lotteryTypeList = $('#lotterytype_list');

    showDownLottery.tap(function(){
        lotteryTypeList.toggle();
    });
    $('li', lotteryTypeList).tap(function(){
        lotteryTypeList.hide();
        $('span', showDownLottery).text($(this).text());
        var lt = $(this).attr('lt');
        changeLottery(lt);
        if(lt == '3d'){
            addPrefix = false;
        }else{
            addPrefix = true;
        }
    });

    $('#close_layer_btn').tap(function(){
        $('#show_result_layer').hide();
    });

    var client = '';
    var agent = navigator.userAgent;
    if((agent.indexOf('iPhone') != -1 || agent.indexOf('iPad') != -1) && agent.indexOf('MicroMessenger') == -1){
        client = 'ios';
    }
    
    $('#android_share_layer').click(function(){
        $(this).hide();
    });
    $('#ios_share_close').click(function(){
        $('#ios_share_layer').hide();
    });

    //url参数
    var searchData = decodeURI(location.search.replace(/\?*/g, '')).split('&');
    var paraObj = {};
    for(var i=0; i<searchData.length; i++){
        var paraArr = searchData[i].split('=');
        paraObj[paraArr[0]] = paraArr[1];
    }
    if(paraObj.numlist){
        resultStore = [];
        var info = paraObj.numlist.split('-');
        var lotteryType = info[0];
        $('span', showDownLottery).text({'ssq': '双色球', 'qlc': '七乐彩', '3d':'3D'}[lotteryType]);
        drawLottery.lotteryType = lotteryType;
        var wagerList = info[1];
        if(lotteryType == 'ssq'){
            var numList = wagerList.split('|');
            resultStore.push(numList[0].split(','));
            resultStore.push(numList[1].split(','));
        }else if(lotteryType == '3d'){
            var numList = wagerList.split(',');
            resultStore.push([numList[0]]);
            resultStore.push([numList[1]]);
            resultStore.push([numList[2]]);
        }else{
            resultStore.push(wagerList.split(','));
        }
        $('#show_result_layer').show();
    }
    initResultLayer();
});

//随机号码列表
function getNumList(min, max, req){
    var numList = [];
    while(numList.length < req){
        var randomNum = getRandomNum(min, max);
        if(addPrefix){
            randomNum = randomNum > 9 ? String(randomNum) : '0' + randomNum;
        }
        if($.inArray(randomNum, numList) == -1){
            numList.push(randomNum);
        }
    }
    return numList;
}

//产生随机数
function getRandomNum(min, max){
    switch(arguments.length){
        case 1: return parseInt(Math.random() * min + 1);
        case 2: return parseInt(Math.random() * (max - min + 1) + min);
        default: return 0;
    }
};

function changeLottery(lotteryType){
    drawLottery.lotteryType = lotteryType;
    drawLottery.drawBackground();
    resultStore = [];
    numListStr = '';
    if(lotteryType == 'ssq'){
        resultStore.push(getNumList(1, 33, 6));
        resultStore.push(getNumList(1, 16, 1));
        numListStr = resultStore[0].join(',') + '|' + resultStore[1].join(',');
        drawLottery.numList = resultStore[0];
        drawLottery.totalNum = 6;
        drawLottery.color = ['#ff1100', '#751116'];
        drawLottery.special = [{
            color: ['#010395', '#156cff'],
            totalNum: 1,
            numList: resultStore[1]
        }]
    }else if(lotteryType == 'qlc'){
        resultStore.push(getNumList(1, 30, 8));
        numListStr = resultStore.join(',');
        drawLottery.numList = resultStore[0];
        drawLottery.totalNum = 8;
        drawLottery.color = ['#ff1100', '#751116'];
        drawLottery.special = '';
    }else if(lotteryType == '3d'){
        resultStore.push(getNumList(0, 9, 1));
        resultStore.push(getNumList(0, 9, 1));
        resultStore.push(getNumList(0, 9, 1));
        numListStr = resultStore.join(',');
        drawLottery.numList = resultStore[0];
        drawLottery.totalNum = 1;
        drawLottery.color = ['#010395', '#156cff'];
        drawLottery.special = [{
            color: ['#010395', '#156cff'],
            totalNum: 1,
            numList: resultStore[1]
        },{
            color: ['#010395', '#156cff'],
            totalNum: 1,
            numList: resultStore[2]
        }]
    }
    initResultLayer();
};

function initResultLayer(){
    $('#layer_title').text({'ssq': '双色球', 'qlc': '七乐彩', '3d':'3D'}[drawLottery.lotteryType] + '摇奖结果');
    var html = '';
    for(var m=0; m<resultStore.length; m++){
        var cls = 'redNum';
        if(drawLottery.lotteryType == '3d' || (drawLottery.lotteryType == 'ssq' && m > 0)){
            cls = 'blueNum';
        }
        for(var i=0; i<resultStore[m].length; i++){
            if(drawLottery.lotteryType == 'qlc' && i > 6){
                cls = 'blueNum';
            }
            html += '<li class="'+ cls +'">'+ resultStore[m][i] +'</li>';
        }
    }
    $('#result_ball_list').html(html);
}