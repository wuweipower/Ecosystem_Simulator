
var canvas = document.getElementById('myCanvas');
var	context = canvas.getContext('2d');

var liveTigers=0;//存活的老虎数量
var liveCows=0;//存活的牛的数量
var liveGrasses=0;//存活的草的数量


const  UP=1;
const DOWN=2;
const LEFT=3;
const RIGHT=4;
const STAY=5;

class species
{
    x;y;
    live;
    energy;
    maxEnergy;
    age;
    maxAge;
    cost_of_prey;
    gain_of_prey;
    speed;
    maxSpeed;
    dir;
    reproduceAge;
    stillReproduce;
    id;
    constructor(){}
    check() 
    {
        if(this.age>this.maxAge) this.live = false;
        if(this.energy<0)this.live;
    }
    move()
    {
        if(this.live)
        {
            switch(this.dir)
            {
                case UP:
                    this.y-=10;
                    break;
                case DOWN:
                    this.y+=10;
                    break;
                case LEFT:
                    this.x-=10;
                    break;
                case RIGHT:
                    this.x+=10;
                    break;
                case STAY:
                    break;
                default:
                    break;
            }
        }
    }

    randomMove()
    {
    
        this.dir = parseInt(Math.random()*10)%5 +1;

        if(check_dir(this.x,this.y,this.dir))
        {
            this.move();
        }
        else
        {
            for(var i =  parseInt(Math.random()*10)%4+1;i<=5;i++)
            {
                if(check_dir(this.x,this.y,i))
                {
                    this.dir = i;
                    this.move();
                    break;
                }
            }
        }
    }
}

class Grass extends species
{
    static number=0;
    constructor(age)
    {
        super();
        this.age=age;
        this.gain_of_prey=2;
        this.maxAge=400;
        this.live = true;
        this.energy=3;
        this.id=this.add();
        this.reproduceAge=10;
        this.stillReproduce = true;
    }
    add()
    {
        Grass.number++;
        return Grass.number;
    }
    tick()//生命时钟
    {
        //每一次时钟次数，年龄都会变化，能量也会变化
        if(this.live)
        {
            this.age++;
            this.energy--;
        }
        this.check();
    }
}

class Cow extends species
{
    static numebr=0;
    constructor() 
    {
        super();
        this.age=0;
        this.gain_of_prey=10;
        this.maxAge=40;
        this.live = true;
        this.energy=3;
        this.id=this.add();
        this.reproduceAge=10;
        this.stillReproduce = true;  
        this.speed=5;
        this.cost_of_prey = 5;
    }
    add()
    {
        Cow.numebr++;
        return Cow.numebr;
    }
    eatGrass(grass)
    {
        if(grass.live)
        {
            grass.energy--;
            grass.gain_of_prey--;
            this.energy = Math.min(this.energy+1-grass.cost_of_prey,this.maxEnergy);
        }
    }
    tick()//生命时钟
    {
        //每一次时钟次数，年龄都会变化，能量也会变化
        if(this.live)
        {
            this.age++;
            this.energy--;
        }
        this.check();
    }
}

class Tiger extends species
{
    static number=0;
    constructor()
    {
        super();
        this.age=0;
        this.gain_of_prey=10;
        this.maxAge=40;
        this.live = true;
        this.energy=3;
        this.id=this.add();
        this.reproduceAge=10;
        this.stillReproduce = true;  
        this.speed=5;
        this.cost_of_prey = 5;  
    }
    add()
    {
        Tiger.number++;
        return Tiger.number;
    }
    eatCow(cow)
    {
        this.energy=Math.min(this.energy+cow.gain_of_prey,this.maxEnergy);
        cow.live=false;
    }
    tick()//生命时钟
    {
        //每一次时钟次数，年龄都会变化，能量也会变化
        if(this.live)
        {
            this.age++;
            this.energy--;
        }
        this.check();
    }
}

var tigers = new Array();
var cows = new Array();
var grasses = new Array();


function inside(x,y,m,n,p,q)//    return x >= 0 && y >= 0 && x < n && m<x && p<y && y<q;
{
    return x >= 0 && y >= 0 && x <= n && m<=x && p<=y && y<=q;
}
function iscollide(s1,s2)
{
   //矩形判断 一个点是否在另外一个矩形里面
    //考虑四个点
    for(var i =0;i<=1;i++)
    {
        for(var j=0;i<=1;j++)
        {
            if(inside(s1.x + i*10, s1.y+i*10, s2.x, s2.x+10, s2.y, s2.y+10))
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
            var index = temp.shift();
            console.log(index);
            grasses[index].live = true;
            grasses[index].age = 0;
            grasses[index].energy=3;
            grasses[index].stillReproduce = true;
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
                tigers[index].live = true;
                tigers[index].age = 0;
                tigers[index].energy=3;
                tigers[index].stillReproduce = true;
                tiegrs[index].x = tigers[i].x;

                tigers[i].stillReproduce = false;
            }
            else
            {
                let temp = new Tiger();
                temp.x = tigers[i].x;
                tigers.push(temp);
                tigers[i].stillReproduce = false;
            }

        }
    }
}

function CowReproduce()
{
    var temp = new Array();
    for(i in cows)
    {
        if(!cows[i].live)
        {
            temp.push(cows[i].id);
        }
    }
    for(i in cows)
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

                cows[i].stillReproduce = false;
                cows[i].energy--;//繁殖需要能量
            }
            else
            {
                let temp = new Cow();
                temp.x = cows[i].x;
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
    tempCows = [];//储存暂时在这里的cow
    tmepTigers=[];//储存暂时在这里的tiger
    CowSmell;//cow留下的气味
    type;//是否为障碍物
    constructor(x,y)
    {
       this.x = x;
       this.y = y;
    }
    deleteCow(id)
    {
        for(i in this.tempCows)
        {
            if(this.tempCows[i].id==id)
            {
                this.tempCows.splice(i,1);
            }
        }
    }
    deleteTiger(id)
    {
        for(i in this.tmepTigers)
        {
            if(this.tmepTigers[i].id==id)
            {
                this.tmepTigers.splice(i,1);
            }
        }
    }


}
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
barriers = [
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
    }
}

function check_dir(x,y,dir)
{
    switch(dir)
    {
        case UP:
            if(inside(x,y-10,0,1000-10,0,600-10)&& grids[(y-10)/10 ][x/10].type!=Barrier)
            return true;
            return false;
            
        case DOWN:
            if(inside(x,y+10,0,1000-10,0,600-10)&& grids[(y+10)/10][x/10].type!=Barrier)
            return true;
            return false;

        case LEFT:
            if(inside(x-10,y,0,1000-10,0,600-10)&& grids[y/10][(x-10)/10].type!=Barrier)
            return true;
            return false;

        case RIGHT:
            if(inside(x+10,y,0,1000-10,0,600-10)&& grids[y/10][(x+10)/10].type!=Barrier)
            return true;
            return false;

        case STAY:
            break;
        default:
            break;
    }
}

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

function TigerBFS(dx,dy)//初始的x,y
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
                preys.push(grids[y/10][x/10].tempCows[k]);
            }
        }
    }

    //确定目标猎物
    if(preys.length==0)
    {
        //console.log("No");
        return false;//未找到猎物 执行根据气味移动的函数
    }



    /**根据某种规则选择猎物，也可以不追这个猎物 */
    console.log("find");
    target = preys[0];
    endX = target.x;
    endY = target.y;


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
        if(map[endY][endX].is_close)
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
   console.log(road);

}


//test BFS
t = new Cow();
t.x=30;
t.y=20;
grids[2][3].tempCows.push(t);
TigerBFS(0,0);















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

function behave()//所有的行动
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
    for(i in cows)
    {
        if(cows[i].live)
        {
            if(CowEscapce)
            {
                //执行逃跑
            }
            else
            {
                if(cows[i].energy>3)
                cows[i].randomMove();
                else
                {
                    //执行找草
                    //执行吃草
                }
            }
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
    for(i in tigers)
    {
        if(tigers[i].live)
        {
            if(tigers[i].energy>4)
            tigers[i].randomMove();
            else
            {
                //执行找牛
                //执行吃牛
            }
            tigers[i].tick();
        }
    }
    //对于可能的情况进行繁殖
    TigerReproduce();

    /**
     * 草的生命时钟tick
     * 繁殖
     */
    for(i in grasses)
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
    setTimeout("draw()",10);
    //console.log();
    //requestAnimationFrame(draw);
}

function play()
{
    //console.log(document.getElementById("ini_t").value);
    var t_num = document.getElementById("ini_t").value;
    var c_num = document.getElementById("ini_c").value;
    //document.getElementById("tigerNum").innerHTML=3000;
    initTiger(t_num);
    initCow(c_num);
    initGrass();
    draw();
    //window.alert("play");
    //window.alert(document.getElementById("myCanvas").width);
}


