function play()
{
    console.log(document.getElementById("ini_t").value);
    document.getElementById("tigerNum").innerHTML=3000;
    //window.alert("play");
    //window.alert(document.getElementById("myCanvas").width);
}

var canvas = document.getElementById('myCanvas');
var	context = canvas.getContext('2d');


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
        if(this.age>this.maxAge) live = false;
        if(this.energy<0)this.live;
    }
    move()
    {
        if(live)
        {
            switch(dir)
            {
                case UP:
                    y--;
                    break;
                case DOWN:
                    y++;
                    break;
                case LEFT:
                    x--;
                    break;
                case RIGHT:
                    x++;
                    break;
                case STAY:
                    break;
                default:
                    break;
            }
        }
    }
    tick()
    {
        if(live)
        age++;
        this.check();
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
}

var tigers = new Array();
var cows = new Array();
var grasses = new Array();

function initGrass()
{
    for(var i=0;i<100;i++)
    {
        for(var j=0;j<60;j++)
        {
            var temp=new Grass(parseInt(Math.random()*10)%10);
            temp.x = i*10;
            temp.y = j*10;
            {if(Math.random()>0.5)  temp.live = true;else  temp.live=false};
            grasses.push(temp);
        }
    }
}

function initCow()
{
    /**
     *     for(var i=0;i<100;i++)
    {
        var temp = new Cow();
        temp.x = parseInt(Math.random()*100)%100;
        temp.y = parseInt(Math.random()*60)%60;
        cows.push(temp);
    }
     */

}

function initTiger()
{
    /**
     *    for(var i=0;i<100;i++)
    {
        var temp = new Tiger();
        temp.x = parseInt(Math.random()*100)%100;
        temp.y = parseInt(Math.random()*60)%60;
        tigers.push(temp);
    } 
     */

}


function drawCow()
{
    for(i in cows)
    {
        context.fillStyle = "black";
        cows[i].x+=1;
        cows[i].y+=1;
        context.fillRect(cows[i].x,cows[i].y,10,10);
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
                tiegrs[index].x = tigers[i].x+10;

                tigers[i].stillReproduce = false;
            }
            else
            {
                let temp = new Tiger();
                temp.x = tigers[i].x+10;
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
                cows[index].x = cows[i].x+10;

                cows[i].stillReproduce = false;
            }
            else
            {
                let temp = new Cow();
                temp.x = cows[i].x+10;
                cows.push(temp);
                cows[i].stillReproduce = false;
            }

        }
    }
}
//下雨的影响
function rain(isRain,specie)
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

class point
{
    constructor(x,y)
    {
        this.x =x;
        this.y=y;
    }
}

//障碍物的位置
barriers = new Array();
barriers.push(new point(50,50));
function barrier()
{

    context.fillStyle="orange";
    context.fillRect(barriers[0].x,barriers[0].y,10,10);
}

/**
 * 整个地图每一个方块的信息
 */
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

}
var grids = new Array();
for(var i=0;i<60;i++)
{
    grids[i] = new Array();
    for(var j=0;j<100;j++)
    {
        grids[i].push(new grid(j*10,i*10));
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
    parent ;
}
//node的类型定义
const Start = 1;
const Barrier = 2;

function inside(x,y,m,n)
{
    return x >= 0 && y >= 0 && x < m && y < n;
}

dir = [[1,0],[0,1],[-1,0],[0,-1]];

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
            if( inside(x,y,1000,600) &&  grids[y/10][x/10].tempCows.length !=0 )
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
            while(map[nx][ny].type!=Start)
            {
                t = new node();
                t = map[ny][nx].parent;
                nx = t.x/10;
                ny = t.y/10;
                if(map[ny][nx].type != Start) map[ny][nx].road=6;
            }
            break;
        }
        for(var i=0;i<4;i++)
        {
            nextX = temp.x + dir[i][0]*10;
            nextY = temp.y + dir[i][1]*10;
            if(inside(nextX,nextY,1000,600)&& !map[nextY/10][nextX/10].is_close && !map[nextY/10][nextX/10].is_open && map[nextY/10][nextX/10].type!=Barrier)
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

}

function CowEscapce()
{
    enemy=[];
    
}

//测试bfs
test = new Cow();
test.x = 40;
test.y = 30;
grids[3][4].tempCows.push(test);
TigerBFS(0,0);



function draw()
{
    context.clearRect(0,0,1000,600);
    for(var i=0;i<100;i++);
    TigerBFS(0,0);
    drawGrass();
    drawCow();
    drawTiger();
    setTimeout("draw()",10);
}
initTiger();
initGrass();
initCow();
draw();
 




