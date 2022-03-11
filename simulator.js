
var canvas = document.getElementById('myCanvas');
var	context = canvas.getContext('2d');

var liveTigers=0;//存活的老虎数量
var liveCows=0;//存活的牛的数量
var liveGrasses=0;//存活的草的数量


var tigers = new Array();
var cows = new Array();
var grasses = new Array();




function iscollide(s1,s2)
{
   //矩形判断 一个点是否在另外一个矩形里面
    //考虑四个点
    for(var i =0;i<=1;i++)
    {
        for(var j=0;j<=1;j++)
        {
            if(inside(s1.x + i*10, s1.y+j*10, s2.x, s2.x+10, s2.y, s2.y+10))
            return true;
        }

    }
    return false;
}



function initGrass()
{
    grasses.splice(0,grasses.length);
    for(var i=0;i<100;i++)
    {
        for(var j=0;j<60;j++)
        {
            var temp=new Grass(parseInt(Math.random()*10)%10);
            temp.x = i*10;
            temp.y = j*10;
            if(Math.random()>0.5)  
            {
                temp.live = true;
                liveGrasses++;
            }
            else  
            temp.live=false;

            grasses.push(temp);
        }
    }
}

function initCow(cowNum)
{
    cows.splice(0,cows.length);
    for(var i=0;i<cowNum;i++)
    {
        var temp = new Cow();
        temp.x = (parseInt(Math.random()*100)%100)*10;
        temp.y = (parseInt(Math.random()*60)%60)*10;
        cows.push(temp);
        liveCows++;
        //初始化grid的cows
        grids[temp.y/10][temp.x/10].tempCows.push(temp.id);
    }
     

}

function initTiger(tigerNum)
{
    tigers.splice(0,tigers.length);
    for(var i=0;i<tigerNum;i++)
    {
        var temp = new Tiger();
        temp.x = (parseInt(Math.random()*100)%100)*10;
        temp.y = (parseInt(Math.random()*60)%60)*10;
        tigers.push(temp);
        liveTigers++;
        //初始化grid的tigers
        grids[temp.y/10][temp.x/10].tmepTigers.push(temp.id);
    } 
     
}




function drawCow()
{

    for(i in cows)
    {
        if(cows[i].live)
        {
            context.fillStyle = "red";
            //cows[i].randomMove();
            context.fillRect(cows[i].x,cows[i].y,10,10);
            liveCows++;
        }

    }
}

function drawGrass()
{

    for(i in grasses)
    {
        if(grasses[i].live)
        {
            context.fillStyle="green";
            context.fillRect(grasses[i].x,grasses[i].y,10,10);
            liveGrasses++;
        }

    }
}

function drawTiger()
{

    for( i in tigers)
    {
        if(tigers[i].live)
        {
            context.fillStyle = "blue";
            context.fillRect(tigers[i].x,tigers[i].y,10,10);
            liveTigers++;
        }
    }
}


/**
 * 繁殖的策略
 * 将可能标记为死亡的个体复活 重新设置属性
 * 或者在数组中增加对象 
 */
function GrassReproduce()
{
    var temp = new Array();
    for(i in grasses)
    {
        if(!grasses[i].live)
        {
            temp.push(grasses[i].id);
        }
    }
    for(i in grasses)
    {
        if(grasses[i].live && temp.length!=0 && grasses[i].age>=grasses[i].reproduceAge && grasses[i].stillReproduce)
        {
            var index = parseInt(Math.random()*temp.length)%temp.length;
            //index = temp.shift();
            var backLiveId = temp[index];
            temp.splice(index,1);
            //console.log(index);
            grasses[backLiveId].live = true;
            grasses[backLiveId].age = 0;
            grasses[backLiveId].energy=3;
            grasses[backLiveId].stillReproduce = true;
            grasses[i].stillReproduce = false;
        }
    }
}

function TigerReproduce()
{
    var temp = new Array();
    for(i in tigers)
    {
        if(!tigers[i].live)
        {
            temp.push(tigers[i].id);
        }
    }
    for(i in tigers)
    {
        if(tigers[i].live  && tigers[i].age>=tigers[i].reproduceAge && tigers[i].stillReproduce)
        {
            if(temp.length!=0)
            {
                var index = temp.shift();
                //console.log('tiger index',index);
                tigers[index].live = true;
                tigers[index].age = 0;
                tigers[index].energy=3;
                tigers[index].stillReproduce = true;
                tigers[index].x = tigers[i].x;
                tigers[index].y = tigers[i].y;
                tigers[i].stillReproduce = false;
            }
            else
            {
                let temp = new Tiger();
                temp.x = tigers[i].x;
                temp.y = tigers[i].y;
                tigers.push(temp);

                tigers[i].stillReproduce = false;
            }

        }
    }
}

function CowReproduce()
{
    var temp = new Array();
    for(var i=0;i<cows.length;i++)
    {
        if(!cows[i].live)
        {
            temp.push(cows[i].id);
        }
    }
    for(var i=0;i<cows.length;i++)
    {
        if(cows[i].live  && cows[i].age>=cows[i].reproduceAge && cows[i].stillReproduce)
        {
            if(temp.length!=0)
            {
                var index = temp.shift();
                cows[index].live = true;
                cows[index].age = 0;
                cows[index].energy=3;
                cows[index].stillReproduce = true;
                cows[index].x = cows[i].x;
                cows[index].y = cows[i].y;
                cows[i].stillReproduce = false;
                cows[i].energy--;//繁殖需要能量
            }
            else
            {
                let temp = new Cow();
                temp.x = cows[i].x;
                temp.y = cows[i].y;
                temp.live = true;
                cows.push(temp);
                cows[i].stillReproduce = false;
                cows[i].energy--;//繁殖需要能量
            }

        }
    }
}

//下雨的影响
function rain(isRain,specie)//持续一段时间，并且在不下雨的时候恢复
{
    if(isRain)
    {
        for(i in specie)
        {
            specie[i].speed--;
            specie[i].energy--;
        }
    }
}

/**
 * 整个地图每一个方块的信息
 */

//小格的类型定义
const Start = 1;
const Barrier = 2;

class grid//一个小格子的信息
{
    tempCows = [];//储存暂时在这里的cow 的id
    tmepTigers=[];//储存暂时在这里的tiger的id
    CowSmell;//cow留下的气味
    type;//是否为障碍物
    constructor(x,y)
    {
       this.x = x;
       this.y = y;
    }
    deleteCow(id)//要与位置移动绑定在一起
    {
        for(i in this.tempCows)
        {
            if(this.tempCows[i]===id)
            {
                this.tempCows.splice(i,1);
            }
        }
    }
    deleteTiger(id)//要与位置移动绑定在一起
    {
        for(i in this.tmepTigers)
        {
            if(this.tmepTigers[i]==id)
            {
                this.tmepTigers.splice(i,1);
            }
        }
    }
}

//创建一个方格的二维数组
var grids = new Array();
for(var i=0;i<60;i++)
{
    grids[i] = new Array();
    for(var j=0;j<100;j++)
    {
        var temp = new grid(j*10,i*10);
        temp.type = 0;
        grids[i].push(temp);
    }
}

//console.log(grids[4][3]);
//障碍物的位置
var barriers = [
    [10,10],
    [20,20],
    [40,50]
];

function drawBarrier()
{
    for(i in barriers)
    {
        context.fillStyle="orange";
        context.fillRect(barriers[i][0],barriers[i][1],10,10);
        grids[barriers[i][1]/10][barriers[i][0]/10].type = Barrier;
    }
}



//BFS专用
class node
{
    x;y;//对应是像素点的位置
    f;g;h;//f = g + h;评价函数用来指导bfs
    type;
    is_open;
    is_close;
    road;
    parent;
    visited;
}



dir = [[1,0],[0,1],[-1,0],[0,-1]];//右，下，左，上


//包含找猎物，找不到后的随机运动，找到后的跟踪
function TigerBFS(id,dx,dy)//初始的x,y
{
    //先九宫格搜索猎物
    var range=10;//格子数
    var preys=[];
    for(var i=0;i<5;i++)
    {
        for(var j=0;j<5;j++)
        {
            x = dx+i*10;
            y = dy+j*10;
            //console.log([x,y]);
            //console.log(grids[y/10][x/10].tempCows.length);
            //continue;
            if( inside(x,y,0,1000-10,0,600-10) &&  grids[y/10][x/10].tempCows.length !=0 )
            {
                for(k in grids[y/10][x/10].tempCows)
                {
                    ///console.log("before",grids[y/10][x/10].tempCows[k],"len:",cows.length);
                    if(cows[grids[y/10][x/10].tempCows[k]].live)
                    {
                        //console.log("after",grids[y/10][x/10].tempCows[k]);
                        preys.push(grids[y/10][x/10].tempCows[k]);
                    }
                }

            }
        }
    }

    //无目标猎物则随机移动
    if(preys.length==0)
    {
        //console.log("No");

        //往气味大的地方移动
        var flag =0;
        var maxSmell =0;
        for(i in dir)
        {
            x = dx + dir[i][0]*10;
            y = dy + dir[i][1]*10;
            if(inside(x,y,0,1000-10,0,600-10))
            {
                if(grids[y/10][x/10].CowSmell>maxSmell)
                {
                    maxSmell = grids[y/10][x/10].CowSmell;
                    flag = i;
                }
            }
        }
        //随机移动
        if(maxSmell==0)
        {
            //console.log("BFS里面的前随机移动x",tigers[id].x);
            //console.log("BFS里面的前随机移动y",tigers[id].y);
            grids[tigers[id].y/10][tigers[id].x/10].deleteTiger(id);
            tigers[id].randomMove();
            grids[tigers[id].y/10][tigers[id].x/10].tmepTigers.push(id);
            //console.log("BFS里面的后随机移动x",tigers[id].x);
            //console.log("BFS里面的后随机移动y",tigers[id].y);
        }
        else
        {
            grids[tigers[id].y/10][tigers[id].x/10].deleteTiger(id);
            if(flag==0)tigers[id].dir=RIGHT;
            else if(flag==1)tigers[id].dir = DOWN;
            else if(flag==2)tigers[id].dir = LEFT;
            else tigers[id].dir = UP;
            tigers[id].move();
            grids[tigers[id].y/10][tigers[id].x/10].tmepTigers.push(id);
        }
        return ;//未找到猎物 执行根据气味移动的函数
    }



    /**根据某种规则选择猎物，也可以不追这个猎物 */
    //console.log("find");
    var target = preys[0];
    //console.log("找到的cow的目标id",target);
    //console.log(target," len:",cows.length);
    endX = cows[target].x;
    endY = cows[target].y;


    //创建地图
    map = new Array();
    for(var i=0;i<60;i++)
    {
        map[i] = new Array();
        for(var j=0;j<100;j++)
        {
            map[i][j] = new node(); 
            map[i][j].x = j*10;
            map[i][j].y = i*10;
            map[i][j].type = grids[i][j].type;
            map[i][j].is_close = map[i][j].is_open = false;
        }
    }

    //BFS
    var road = [];
    var open = new queue();
    
    map[dy/10][dx/10].type = Start;

    open.push(map[dy/10][dx/10]);
    
    while(!open.empty())
    {
        var temp = open.pop();
        map[temp.y/10][temp.x/10].is_close = true;
        if(map[endY/10][endX/10].is_close)
        {
            nx = endX/10;
            ny = endY/10;
            while(map[ny][nx].type!=Start)
            {
                t = new node();
                t = map[ny][nx].parent;
                nx = t.x/10;
                ny = t.y/10;
                if(map[ny][nx].type != Start) 
                {
                    map[ny][nx].road=6;
                    road.push([nx,ny]);
                }

            }
            break;
        }

        for(var i=0;i<4;i++)
        {
            nextX = temp.x + dir[i][0]*10;
            nextY = temp.y + dir[i][1]*10;
            //console.log(nextX,nextY);
            if(inside(nextX,nextY,0,1000-10,0,600-10) && !map[nextY/10][nextX/10].is_close && !map[nextY/10][nextX/10].is_open && map[nextY/10][nextX/10].type!=Barrier)
            {
                u = map[nextY/10][nextX/10];
                u.parent = map[temp.y/10][temp.x/10];
                u.is_open = true;
                open.push(u);
            }
        }
    }
    //下面是打印路径
    /*
    for(var i =0;i<60;i++)
    {
        for(var j=0;j<100;j++)
        {
            if(map[i][j].road==6)
            console.log(map[i][j].x,map[i][j].y);
        }
    }
    */ 
   //console.log(road);
   


}


//test BFS
// t = new Cow();
// t.x=30;
// t.y=20;
// grids[2][3].tempCows.push(t);
// TigerBFS(0,0);


//目前未完全实现
function CowEscapce(x,y)
{
    enemy=[];
    var start = [x,y];
    var q = new queue();
    //var next;
    var flag = false;
    q.push(start);
    while(!q.empty())
    {
        start = q.pop();
        for(i in dir)
        {
            var nextX = start[0]+dir[i][0]*10;
            var nextY = start[1]+dir[i][1]*10;
            if(inside(nextX,nextY,Math.max(0,x-50),Math.min(1000,x+50),Math.max(0,y-60),Math.min(600,y+60)) && 
            grids[nextY/10][nextX/10].tmepTigers.length !=0)//未做已访问处理
            {
                enemy.push(grids[nextY/10][nextX/10].tmepTigers[0]);
                flag = true;
                break;
            }
        }
        if(flag)
        break;
    }

}


function CowFindGrass(id)
{
    iden = (cows[id].x/10)*60+(cows[id].y/10);
    if(cows[id].eatGrass(grasses[iden]))
    {
        return;
    }
    for(var i =-1;i<=1;i++)
    {
        for(var j=-1;j<=1;j++)
        {
            if(inside(cows[id].x + i*10, cows[id].y+j*10, 0,1000-10,0,600-10))
            {
                iden = (cows[id].x/10 +i)*60+(cows[id].y/10 +j);
                if(grasses[iden].live)
                {
                    grids[cows[id].y/10][cows[id].x/10].deleteCow(id);
                    cows[id].eatGrass(grasses[iden]);
                    cows[id].x = grasses[iden].x;
                    cows[id].y = grasses[iden].y;
                    grids[cows[id].y/10][cows[id].x/10].tempCows.push(id);
                    return;
                }
            }
        }
    }
}
//所有的行动
function behave()
{

    if(Math.random()<0.3)
    {
        //rain(true,cows);//
    }

    //对于牛的运动
    /**
     * 如果能量足够就随机移动或者繁殖否则找草吃
     * 如果需要逃跑则逃跑
     * 生命时钟tick
     */
    for(var i =0;i<cows.length;i++)
    {
        if(cows[i].live)
        {
            //console.log("a",i)
            if(0)
            {
                //执行逃跑
            }
            else
            {
                //console.log("a",i);
                if(cows[i].energy>20)//随便走
                {
                    //console.log("again",i);
                    grids[cows[i].y/10][cows[i].x/10].deleteCow(cows[i].id);
                    //console.log("b",i);
                    cows[i].randomMove();
                    grids[cows[i].y/10][cows[i].x/10].tempCows.push(cows[i].id);
                }
                else
                {
                    CowFindGrass(i);
                }
            }
            ///console.log("b",i)
            cows[i].tick();
        }

    }

    //对于可能的情况进行繁殖
    CowReproduce();

    //对于老虎的运动
    /**
     * 如果能量足够就随机移动或者繁殖否则就捕捉牛
     * 生命时钟tick
     */
    for(var i=0;i<tigers.length;i++)
    {
        if(tigers[i].live)
        {
            //console.log(tigers[i].x,"每次的x")
            //console.log(tigers[i].y,"每次的y")

            if(tigers[i].energy>2)//温饱状态
            {
                grids[tigers[i].y/10][tigers[i].x/10].deleteTiger(tigers[i].id);
                tigers[i].randomMove();
                grids[tigers[i].y/10][tigers[i].x/10].deleteTiger(tigers[i].id);
            }

            else
            {

                TigerBFS(i,tigers[i].x,tigers[i].y);
            }
            tigers[i].tick();
        }
        else
        {
            grids[tigers[i].y/10][tigers[i].x/10].deleteTiger(i);
        }
    }
    //对于可能的情况进行繁殖
    TigerReproduce();

    /**
     * 草的生命时钟tick
     * 繁殖
     */
    for(var i=0;i<grasses.length;i++)
    {
        if(grasses[i].live)
        {
            grasses[i].tick();
        }
    }
    GrassReproduce();

}


function draw()
{
    context.clearRect(0,0,1000,600);
    //for(var i=0;i<100;i++);
    //TigerBFS(0,0);
    drawGrass();
    drawCow();
    drawTiger();
    drawBarrier();
    document.getElementById("tigerNum").innerHTML=liveTigers;
    document.getElementById("grassNum").innerHTML=liveGrasses;
    document.getElementById("cowNum").innerHTML=liveCows;
    behave();

    liveCows=0;
    liveGrasses=0;
    liveTigers=0;
    setTimeout("draw()",100);
    //console.log();
    //requestAnimationFrame(draw);
}

function play()
{
    //console.log(document.getElementById("ini_t").value);
    var t_num = document.getElementById("ini_t").value;
    var c_num = document.getElementById("ini_c").value;
    //document.getElementById("tigerNum").innerHTML=3000;
    tigers.splice(0,tigers.length);
    grasses.splice(0,grasses.length);
    cows.splice(0,cows.length);
    liveCows=0;
    liveGrasses=0;
    liveTigers=0;
    initTiger(t_num);
    initCow(c_num);
    initGrass();
    Grass.number=-1;
    Cow.numebr=-1;
    Tiger.number = -1;
    //console.log(Tiger.number);
    draw();
    //window.alert("play");
    //window.alert(document.getElementById("myCanvas").width);
}

//测试碰撞函数

// t1 = new Tiger();
// t1.x = 0;
// t1.y =0;
// c1 = new Cow();
// c1.x = 400;
// c1.y = 0;
// while(1)
// {
//     if(t1.live)
//     {
//         context.fillStyle = "blue";
//         context.fillRect(t1.x,t1.y,10,10);
//     }
//     if(c1.live)
//     {
//         context.fillStyle = "red";
//         context.fillRect(c1.x,c1.y,10,10);
//     }
//     if(!iscollide(t1,c1))
//     {
//         t1.x+=1;
//     }
//     else
//     {
//         t1.eatCow(c1);
//         console.log(c1.live);
//         break;
//     }
// }

