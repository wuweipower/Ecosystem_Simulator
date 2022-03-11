const  UP=1;
const DOWN=2;
const LEFT=3;
const RIGHT=4;
const STAY=5;


//判断这个方向是否越界或者是障碍物
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
            return true;
            //break;
        default:
            return false;
            //break;
    }
}
function inside(x,y,m,n,p,q)//    return x >= 0 && y >= 0 && x < n && m<x && p<y && y<q;
{
    return x >= 0 && y >= 0 && x <= n && m<=x && p<=y && y<=q;
}


class species
{
    x;
    y;//坐标 都是10倍
    live;//一个flag，标记
    energy;
    maxEnergy;
    fullEnergy;//比较温饱的能量
    age;
    maxAge;//最大年纪
    cost_of_prey;
    gain_of_prey;
    normalSpeed;//正常速度
    speed;//一次移动多少格 目前速度
    maxSpeed;//最大速度
    dir;//目前的方向
    reproduceAge;
    stillReproduce;//设计为与年龄有关的 是否再生育
    id;//从0开始
    constructor(){}
    check() 
    {
        if(this.age>this.maxAge) this.live = false;
        if(this.energy<=0) this.live = false;
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
    static number=-1;
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
            //this.energy--;
        }
        this.check();
    }
}

class Cow extends species
{
    static numebr=-1;
    constructor() 
    {
        super();
        this.age=0;
        this.gain_of_prey=10;
        this.maxAge=40;
        this.live = true;
        this.energy=30;
        this.maxEnergy=40;
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
            return true;
        }
        else
        return false;
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
    static number=-1;
    constructor()
    {
        super();
        this.age=0;
        this.gain_of_prey=10;
        this.maxAge=40;
        this.live = true;
        this.energy=30;
        this.maxEnergy=40;
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

