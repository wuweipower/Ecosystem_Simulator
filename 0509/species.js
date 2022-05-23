//Direction 编号
const  UP=1;
const DOWN=2;
const LEFT=3;
const RIGHT=4;
const STAY=5;

const TIGER=1;
const COW=2;
const GRASS=3;

//unit，一个格子长宽均为10
const unit=10;

//map matrix size
const map_matrix_x=150;
const map_matrix_y=150;

//map 大小
const upperBound_x=map_matrix_x*unit;
const lowerBound_x=0;
const upperBound_y=map_matrix_y*unit;
const lowerBound_y=0;



//晴天、阴天、雨天
const SUN=1;
const CLOUDY=2;
const RAIN=3;
const SUN_P=0.6;
const CLOUDY_P=0.75; //0.4*0.75
//rain概率为0.1；
var weather=SUN;//默认天气
//晴天和雨天，草生长速度较快。阴天和雨天，牛和老虎每日固定消耗的能量更多。晴天和阴天，牛和老虎行动的次数越多（速度越快）


//Grass limitation attribution:
//能量模块
const Grass_maxEnergy=10;//最大能量条
const Grass_fullEnergy=5;//比较温饱的能量
//年龄模块
const Grass_maxAge=20;//最大年纪
//捕食与被捕食模块
const Grass_cost_of_prey=1;
const Grass_gain_of_prey=10;
//繁殖模块
//const Grass_reproduceAge=2;//繁殖年龄限制

//Cow limitation attribution:
//能量模块
const Cow_maxEnergy=60;//最大能量条
const Cow_fullEnergy=42;//比较温饱的能量
const Cow_dailyEnergy_Sun=3;//晴天每日消耗的能量
const Cow_dailyEnergy_Cloudy_Rain=4;//阴雨天每日消耗的能量
//年龄模块
const Cow_maxAge=60;//最大年纪
//捕食与被捕食模块
const Cow_cost_of_prey=5;
const Cow_gain_of_prey=30;
//行动模块
const Cow_Speed_Rain=2;//雨天速度
const Cow_Speed_Sun_Cloudy=3;//晴天和阴天速度
//繁殖模块
const Cow_reproduceAge_lowerBound=10;//繁殖年龄限制
const Cow_reproduceAge_upperBound=50;

//Tiger limitation attribution:
//能量模块
const Tiger_maxEnergy=100;//最大能量条
const Tiger_fullEnergy=70;//比较温饱的能量
const Tiger_dailyEnergy_Sun=5;//晴天每日消耗的能量
const Tiger_dailyEnergy_Cloudy_Rain=6;//阴雨天每日消耗的能量
//年龄模块
const Tiger_maxAge=80;//最大年纪
//行动模块
const Tiger_Speed_Rain=3;//雨天速度
const Tiger_Speed_Sun_Cloudy=5;//晴天和阴天速度
//繁殖模块
const Tiger_reproduceAge_lowerBound=15;//繁殖年龄限制
const Tiger_reproduceAge_upperBound=60;

//草生长速度
const Grass_grow_Sun_Rain=2;
const Grass_grow_Cloudy=1;
var Grass_grow=Grass_grow_Sun_Rain;

//受孕概率
const Cow_reproduceRate=0.3;
const Tiger_reproduceRate=0.2;

//繁殖消耗的能量
const Cow_reproduceEnergy=15;
const Tiger_reproduceEnergy=20;

//最高繁殖次数
const Cow_reproduceMaxNum=4;
const Tiger_reproduceMaxNum=2;

//个体差异基数 0.1*Grass_alpha
const Grass_alpha=8;
const Cow_alpha=7;
const Tiger_alpha=7;
//parseInt(0.1*(Tiger_alpha+(10-Tiger_alpha)*Math.random())*xxx)
//parseInt(0.1*(Cow_alpha+(10-Cow_alpha)*Math.random())*xxx)
//parseInt(0.1*(Grass_alpha+(10-Grass_alpha)*Math.random())*xxx)

//繁殖能量参数
const Grass_reproduceEnergyLimit=10;
const Cow_reproduceEnergyLimit=40;
const Tiger_reproduceEnergyLimit=65;

//行动消耗的能量
const run_unit=1;

//未必选最优空草地
const Cow_exploreOther=0.4;
const Tiger_exploreOther=0.4;

//范围变更参数
const Grass_range_r = 0.4;
const Grass_range = (1-(Grass_range_r/2)+Grass_range_r*Math.random());
const Cow_range_r = 0.4;
const Cow_range = (1-(Cow_range_r/2)+Cow_range_r*Math.random());
const Tiger_range_r = 0.4;
const Tiger_range = (1-(Tiger_range_r/2)+Tiger_range_r*Math.random());

//
//判断这个方向是否越界或者是障碍物
function check_dir(x,y,dir)
{
    switch(dir)
    {
        case UP:
            if(inside(x,y-unit,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit)&& grids[(y-unit)/unit ][x/unit].type!=Barrier)
            return true;
            return false;
            
        case DOWN:
            if(inside(x,y+unit,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit)&& grids[(y+unit)/unit][x/unit].type!=Barrier)
            return true;
            return false;

        case LEFT:
            if(inside(x-unit,y,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit)&& grids[y/unit][(x-unit)/unit].type!=Barrier)
            return true;
            return false;

        case RIGHT:
            if(inside(x+unit,y,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit)&& grids[y/unit][(x+unit)/unit].type!=Barrier)
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


//检测(x,y)是否在map上
function inside(x,y,m,n,p,q)//    return x >= 0 && y >= 0 && m<x && x < n  && p<y && y<q;
{
    return x >= 0 && y >= 0&& m<=x  && x <= n && p<=y && y<=q;
}


//物种类
class species
{
    id;//从0开始
    x;
    y;//坐标 都是10倍
    live;//一个flag，标记

//能量模块
    energy;
    maxEnergy;//最大能量条
    fullEnergy;//比较温饱的能量
    dailyEnergy_Sun;//每日消耗的能量_晴天
    dailyEnergy_Cloudy_Rain;//每日消耗的能量_阴天雨天


//年龄模块
    age;
    maxAge;//最大年纪

    cost_of_prey;
    gain_of_prey;

//行动模块
    normalSpeed;//正常速度
    speed;//一次移动多少格 目前速度
    maxSpeed;//最大速度
    dir;//目前的方向

//繁殖模块
    reproduceAge_lowerBound;//繁殖年龄限制
    reproduceAge_upperBound;
    reproduceNum;//繁殖次数


    constructor(){}
    check() 
    {
        if(this.age>this.maxAge) {this.live = false;return true;}
        if(this.energy<=0) {this.live = false;return true;}
        return false;
    }
    checkEnergy(){
        if(this.energy<=0) {this.live = false;return true;}
        return false;
    }
    move(type)
    {   if(type==TIGER){
            if(this.live)
            {
                switch(this.dir)
                {
                    case UP:
                        this.y-=unit;
                        this.energy-=2*run_unit;
                        break;
                    case DOWN:
                        this.y+=unit;
                        this.energy-=2*run_unit;
                        break;
                    case LEFT:
                        this.x-=unit;
                        this.energy-=2*run_unit;
                        break;
                    case RIGHT:
                        this.x+=unit;
                        this.energy-=2*run_unit;
                        break;
                    case STAY:
                        break;
                    default:
                        break;
                }
            }
        }
        else if(type==COW){
            if(this.live)
            {
                switch(this.dir)
                {
                    case UP:
                        this.y-=unit;
                        this.energy-=run_unit;
                        break;
                    case DOWN:
                        this.y+=unit;
                        this.energy-=run_unit;
                        break;
                    case LEFT:
                        this.x-=unit;
                        this.energy-=run_unit;
                        break;
                    case RIGHT:
                        this.x+=unit;
                        this.energy-=run_unit;
                        break;
                    case STAY:
                        break;
                    default:
                        break;
                }
            }
        }
        grids[this.y/unit][this.x/unit].CowSmell+=0.5*(this.age/this.maxAge)
    }

    randomMove(type)
    {
    
        this.dir = parseInt(Math.random()*1000)%4 +1;

        if(check_dir(this.x,this.y,this.dir))
        {
            if(type==TIGER){
                this.move(TIGER);
            }
            else if(type==COW){
                this.move(COW)
            }
            return;
        }
        else
        {
            //环形链表,不会选到stay
            var k=parseInt(parseInt(Math.random()*1000)%4+1);
            for(var i = 0;i<4;i++)
            {
                if(check_dir(this.x,this.y,(i+k)%4))
                {
                    this.dir = (i+k)%4;
                    if(type==TIGER){
                        this.move(TIGER);
                    }
                    else if(type==COW){
                        this.move(COW)
                    }
                    return;
                }
            }
        }
        //else stay
    }
}

class Grass extends species
{
    static number=-1;
    constructor(age)
    {
        super();
        this.id=this.add();
        this.live = true;

        this.maxAge=Grass_maxAge*Grass_range;
        this.age=age;

        this.maxEnergy=Grass_maxEnergy*Grass_range;
        this.fullEnergy=Grass_fullEnergy*Grass_range;
        this.energy=this.maxEnergy-Math.pow(this.age-this.maxAge/2,2)/Math.pow(this.maxAge/2,2)*(this.maxEnergy-this.fullEnergy);

        this.cost_of_prey=Grass_cost_of_prey*Grass_range;
        this.gain_of_prey=Grass_gain_of_prey*Grass_range;

        
    }
    add()
    {
        Grass.number++;
        return Grass.number;
    }
    beLive(){
        this.live = true;

        this.maxAge=Grass_maxAge*Grass_range;
        this.age=0;

        this.maxEnergy=Grass_maxEnergy*Grass_range;
        this.fullEnergy=Grass_fullEnergy*Grass_range;

        this.cost_of_prey=Grass_cost_of_prey*Grass_range;
        this.gain_of_prey=Grass_gain_of_prey*Grass_range;

        
    }
    tick()//生命时钟
    {   
        var flag;
        //每一次时钟次数，年龄都会变化，能量也会变化
        if(this.live)
        {   //二次函数this.maxEnergy-((this.age-this.maxAge/2)^2)/((this.maxAge/2)^2)*(this.maxEnergy-this.fullEnergy)
            this.energy=Math.min(this.maxEnergy,this.energy-(1+2*this.age-this.maxAge)/Math.pow(this.maxAge/2,2)*(this.maxEnergy-this.fullEnergy));
            this.age++;
            flag=this.check();
            //this.energy--;
            if(flag) {
                this.energy=0;
            }
        }
        else{
            if(weather==CLOUDY){
                Grass_grow=Grass_grow_Cloudy*Grass_range;
            }
            else{
                Grass_grow=Grass_grow_Sun_Rain*Grass_range;
            }
            this.energy=this.energy+Grass_grow;
        }
    }
}

class Cow extends species
{
    static numebr=-1;
    constructor() 
    {
        super();
        this.id=this.add();
        this.live = true;
        /* this.age=0;
        this.gain_of_prey=10;
        this.maxAge=40;
        this.live = true;
        this.energy=30;
        this.maxEnergy=40;
        this.id=this.add();
        this.reproduceAge_lowerBound=10;
        this.reproduceNum = 0;  
        this.speed=5;
        this.cost_of_prey = 5;
         */

        this.maxAge=Cow_maxAge*Cow_range;
        this.age=0;

        this.maxEnergy=Cow_maxEnergy*Cow_range;
        this.fullEnergy=Cow_fullEnergy*Cow_range;
        this.dailyEnergy_Sun=Cow_dailyEnergy_Sun*Cow_range;
        this.dailyEnergy_Cloudy_Rain=Cow_dailyEnergy_Cloudy_Rain*Cow_range;
        this.energy=this.fullEnergy;
        

        this.maxSpeed=Cow_Speed_Sun_Cloudy*Cow_range;
        this.speed=Cow_Speed_Sun_Cloudy*Cow_range;

        this.cost_of_prey=Cow_cost_of_prey*Cow_range;
        this.gain_of_prey=Cow_gain_of_prey*Cow_range;

        this.reproduceAge_lowerBound=Cow_reproduceAge_lowerBound*Cow_range;
        this.reproduceAge_upperBound=Cow_reproduceAge_upperBound*Cow_range;
        this.reproduceNum = 0;

        this.dir=parseInt(Math.random()*10000)%5+1;
    }
    add()
    {
        Cow.numebr++;
        return Cow.numebr;
    }
    beLive(){
        this.live=true;

        this.maxAge=Cow_maxAge*Cow_range;
        this.age=0;

        this.maxEnergy=Cow_maxEnergy*Cow_range;
        this.fullEnergy=Cow_fullEnergy*Cow_range;
        this.dailyEnergy_Sun=Cow_dailyEnergy_Sun*Cow_range;
        this.dailyEnergy_Cloudy_Rain=Cow_dailyEnergy_Cloudy_Rain*Cow_range;
        this.energy=this.fullEnergy;
        
        this.maxSpeed=Cow_Speed_Sun_Cloudy*Cow_range;
        this.speed=Cow_Speed_Sun_Cloudy*Cow_range;

        this.cost_of_prey=Cow_cost_of_prey*Cow_range;
        this.gain_of_prey=Cow_gain_of_prey*Cow_range;

        this.reproduceAge_lowerBound=Cow_reproduceAge_lowerBound*Cow_range;
        this.reproduceAge_upperBound=Cow_reproduceAge_upperBound*Cow_range;
        this.reproduceNum = 0;
    }

    eatGrass(grass)
    {
        if(grass.live && this.energy>=grass.cost_of_prey)
        {
            this.energy = Math.min(this.energy+grass.gain_of_prey-grass.cost_of_prey,this.maxEnergy);
            grass.live=false;
            grass.energy=0;
            return true;
        }
        return false;
    }
    moveToGrass(grass_cluster,cow_cluster){
        var max=-1;
        var objectIndex=0;

        var now_y=parseInt(this.y/grass_cluster_y);
        var now_x=parseInt(this.x/grass_cluster_x); 
         //console.log(now_x);
        //console.log(now_y);

        //视野信息
        var localInformationArea_lowerBound=0;
        var localInformationArea_upperBound=grass_cluster.length;


        for(var i=localInformationArea_lowerBound;i<localInformationArea_upperBound;i++){
            if(cow_cluster[i]!=0){
                if(grass_cluster[i]/cow_cluster[i]>max && Math.random()>=Cow_exploreOther){
                    max=grass_cluster[i]/cow_cluster[i];
                    objectIndex=i;
                }
            }
            else{
                if(grass_cluster[i]>max && Math.random()>=Cow_exploreOther){
                    max=grass_cluster[i];
                    objectIndex=i;
                }
            }
        }
        
        var object_y=objectIndex%(parseInt(upperBound_y/grass_cluster_y));
        var object_x=parseInt(objectIndex/(parseInt(upperBound_y/grass_cluster_y)));
        //console.log("objectIndex");
        //console.log(objectIndex);
        //console.log(object_x);
        //console.log(object_y);
        

        //引导向量
        var vector_x=object_x-now_x;
        var vector_y=object_y-now_y;

        //console.log("vector");
        //console.log(vector_x);
        //console.log(vector_y);

        if(vector_x==0&&vector_y==0){
            this.randomMove(COW);
            return;
        }
        if(Math.abs(vector_x)==Math.abs(vector_y)){
            if(Math.random()>=0.5){
                if(vector_x>0 && check_dir(this.x,this.y,RIGHT)){
                    this.dir=RIGHT;
                    //console.log(this.dir);
                    this.move(COW);
                    return;
                }
                else if(check_dir(this.x,this.y,LEFT)){
                    this.dir=LEFT;
                    //console.log(this.dir);
                    this.move(COW);
                    return;
                }
            }
            //else
            if(vector_y>0&&check_dir(this.x,this.y,DOWN)){
                this.dir=DOWN;
                //console.log(this.dir);
                this.move(COW);
                return;
            }
            else if (check_dir(this.x,this.y,UP)){
                this.dir=UP;
                //console.log(this.dir);
                this.move(COW);
                return;
            }
        }
        if(Math.abs(vector_x)>Math.abs(vector_y)){
            if(vector_x>0 && check_dir(this.x,this.y,RIGHT)){
                this.dir=RIGHT;
                //console.log(this.dir);
                this.move(COW);
                return;
            }
            else if(check_dir(this.x,this.y,LEFT)){
                this.dir=LEFT;
                //console.log(this.dir);
                this.move(COW);
                return;
            }
        }
        if(vector_y>0&&check_dir(this.x,this.y,DOWN)){
            this.dir=DOWN;
            //console.log(this.dir);
            this.move(COW);
            return;
        }
        else if (check_dir(this.x,this.y,UP)){
            this.dir=UP;
            //console.log(this.dir);
            this.move(COW);
            return;
        }
    }
    tick()//生命时钟
    {   //var flag=false;
        //每一次时钟次数，年龄都会变化，能量也会变化
        if(this.live)
        {
            //二次函数this.maxEnergy-((this.age-this.maxAge/2)^2)/((this.maxAge/2)^2)*(this.maxEnergy-this.fullEnergy)
            if(weather==SUN){
                this.energy=Math.min(this.maxEnergy,this.energy-(1+2*this.age-this.maxAge)/Math.pow(this.maxAge/2,2)*(this.maxEnergy-this.fullEnergy)-this.dailyEnergy_Sun);
            }
            else{
                this.energy=Math.min(this.maxEnergy,this.energy-(1+2*this.age-this.maxAge)/Math.pow(this.maxAge/2,2)*(this.maxEnergy-this.fullEnergy)-this.dailyEnergy_Cloudy_Rain);
            }
            //flag=true;
            this.age++;
            //this.energy--;
        }
        if(this.check()){grids[this.y/unit][this.x/unit].deleteCow(this.id);};
    }
}

class Tiger extends species
{
    static number=-1;
    constructor()
    {
        super();
        this.id=this.add();
        this.live = true;
        /* this.age=0;
        this.gain_of_prey=10;
        this.maxAge=40;
        this.live = true;
        this.energy=30;
        this.maxEnergy=40;
        this.id=this.add();
        this.reproduceAge_lowerBound=10;
        this.reproduceNum = 0;  
        this.speed=5;
        this.cost_of_prey = 5;   */

        this.maxAge=Tiger_maxAge*Tiger_range;
        this.age=0;

        this.maxEnergy=Tiger_maxEnergy*Tiger_range;
        this.fullEnergy=Tiger_fullEnergy*Tiger_range;
        this.dailyEnergy_Sun=Tiger_dailyEnergy_Sun*Tiger_range;
        this.dailyEnergy_Cloudy_Rain=Tiger_dailyEnergy_Cloudy_Rain*Tiger_range;
        this.energy=this.fullEnergy;
        

        this.maxSpeed=Tiger_Speed_Sun_Cloudy*Tiger_range;
        this.speed=Tiger_Speed_Sun_Cloudy*Tiger_range;

        this.reproduceAge_lowerBound=Tiger_reproduceAge_lowerBound*Tiger_range;
        this.reproduceAge_upperBound=Tiger_reproduceAge_upperBound*Tiger_range;
        this.reproduceNum = 0;

        this.dir=parseInt(Math.random()*10000)%5+1;
    }
    add()
    {
        Tiger.number++;
        return Tiger.number;
    }
    eatCow(cow)
    {
        //console.log(cow.live,cow.age,cow.x,cow.y)
        if(this.energy>=cow.cost_of_prey){
            this.energy=Math.min(this.energy+cow.gain_of_prey-cow.cost_of_prey,this.maxEnergy);
            cow.live=false;
            grids[cow.y/unit][cow.x/unit].deleteCow(cow.id);
            return true;
        }
        return false;
    }
    beLive(){
        this.live=true;

        this.maxAge=Tiger_maxAge*Tiger_range;
        this.age=0;

        this.maxEnergy=Tiger_maxEnergy*Tiger_range;
        this.fullEnergy=Tiger_fullEnergy*Tiger_range;
        this.dailyEnergy_Sun=Tiger_dailyEnergy_Sun*Tiger_range;
        this.dailyEnergy_Cloudy_Rain=Tiger_dailyEnergy_Cloudy_Rain*Tiger_range;
        this.energy=this.fullEnergy;
        

        this.maxSpeed=Tiger_Speed_Sun_Cloudy*Tiger_range;
        this.speed=Tiger_Speed_Sun_Cloudy*Tiger_range;

        this.reproduceAge_lowerBound=Tiger_reproduceAge_lowerBound*Tiger_range;
        this.reproduceAge_upperBound=Tiger_reproduceAge_upperBound*Tiger_range;
        this.reproduceNum = 0;
    }
    moveToCow(cow_cluster,tiger_cluster){
        var max=-1;
        var objectIndex=0;

        var now_y=parseInt(this.y/cow_cluster_y);
        var now_x=parseInt(this.x/cow_cluster_x); 
         //console.log(now_x);
        //console.log(now_y);

        //视野信息
        var localInformationArea_lowerBound=0;
        var localInformationArea_upperBound=cow_cluster.length;


        for(var i=localInformationArea_lowerBound;i<localInformationArea_upperBound;i++){
            if(tiger_cluster[i]!=0){
                if(cow_cluster[i]/tiger_cluster[i]>max && Math.random()>=Tiger_exploreOther){
                    max=cow_cluster[i]/tiger_cluster[i];
                    objectIndex=i;
                }
            }
            else{
                if(cow_cluster[i]>max && Math.random()>=Tiger_exploreOther){
                    max=cow_cluster[i];
                    objectIndex=i;
                }
            }
        }
        
        var object_y=objectIndex%(parseInt(upperBound_y/cow_cluster_y));
        var object_x=parseInt(objectIndex/(parseInt(upperBound_y/cow_cluster_y)));
        //console.log("objectIndex");
        //console.log(objectIndex);
        //console.log(object_x);
        //console.log(object_y);
        

        //引导向量
        var vector_x=object_x-now_x;
        var vector_y=object_y-now_y;

        //console.log("vector");
        //console.log(vector_x);
        //console.log(vector_y);

        if(vector_x==0&&vector_y==0){
            this.randomMove(TIGER);
            return;
        }
        if(Math.abs(vector_x)==Math.abs(vector_y)){
            if(Math.random()>=0.5){
                if(vector_x>0 && check_dir(this.x,this.y,RIGHT)){
                    this.dir=RIGHT;
                    //console.log(this.dir);
                    this.move(TIGER);
                    return;
                }
                else if(check_dir(this.x,this.y,LEFT)){
                    this.dir=LEFT;
                    //console.log(this.dir);
                    this.move(TIGER);
                    return;
                }
            }
            //else
            if(vector_y>0&&check_dir(this.x,this.y,DOWN)){
                this.dir=DOWN;
                //console.log(this.dir);
                this.move(TIGER);
                return;
            }
            else if (check_dir(this.x,this.y,UP)){
                this.dir=UP;
                //console.log(this.dir);
                this.move(TIGER);
                return;
            }
        }
        if(Math.abs(vector_x)>Math.abs(vector_y)){
            if(vector_x>0 && check_dir(this.x,this.y,RIGHT)){
                this.dir=RIGHT;
                //console.log(this.dir);
                this.move(TIGER);
                return;
            }
            else if(check_dir(this.x,this.y,LEFT)){
                this.dir=LEFT;
                //console.log(this.dir);
                this.move(TIGER);
                return;
            }
        }
        if(vector_y>0&&check_dir(this.x,this.y,DOWN)){
            this.dir=DOWN;
            //console.log(this.dir);
            this.move(TIGER);
            return;
        }
        else if (check_dir(this.x,this.y,UP)){
            this.dir=UP;
            //console.log(this.dir);
            this.move(TIGER);
            return;
        }

    }
    tick()//生命时钟
    {   //var flag=false;
        //每一次时钟次数，年龄都会变化，能量也会变化
        if(this.live)
        {
            //二次函数this.maxEnergy-((this.age-this.maxAge/2)^2)/((this.maxAge/2)^2)*(this.maxEnergy-this.fullEnergy)
            if(weather==SUN){
                this.energy=Math.min(this.maxEnergy,this.energy-(1+2*this.age-this.maxAge)/Math.pow(this.maxAge/2,2)*(this.maxEnergy-this.fullEnergy)-this.dailyEnergy_Sun);
            }
            else{
                this.energy=Math.min(this.maxEnergy,this.energy-(1+2*this.age-this.maxAge)/Math.pow(this.maxAge/2,2)*(this.maxEnergy-this.fullEnergy)-this.dailyEnergy_Cloudy_Rain);
            }
            this.age++;
            //flag=true;
            //this.energy--;
        }
        if(this.check()){grids[this.y/unit][this.x/unit].deleteTiger(this.id);};
    }
}

