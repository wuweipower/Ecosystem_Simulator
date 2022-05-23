//color
const color_grass="#5A8A50"
const color_blank="#4D4E52"
const color_cow="#4FAAFF"
const color_tiger="#F9F871"
const color_barrier="#0D2400"
const color_tag="red"

//初始草坪覆盖率
const GrassCoverRate=0.80;

//画布
var canvas = document.getElementById('myCanvas');
var	context = canvas.getContext('2d');

//
var liveTigers=0;//存活的老虎数量
var liveCows=0;//存活的牛的数量
var liveGrasses=0;//存活的草的数量

//容器
var tigers = new Array();
var cows = new Array();
var grasses = new Array();

// 牛各行动执行概率
//牛的行动分为：逃避老虎的追击，饥饿状态下寻找草，温饱状态下的行动——基于全局信息智能的移向草牛比最大的区域、随机移动、保持原地不动
const Cow_escapceP=0.8;             //检测到附近有老虎，但只有0.8概率会选择逃跑
const Cow_randomBehaveEnergy=30;    //cows[i].energy-Cow_randomRunEnergy，温饱状态的界定
const Cow_randomBehaveP=0.8;        //otherwise，温饱状态下仍寻找草吃——贪心者
const Cow_randomRunP=0.5;           //otherwise, stay——安逸者
const Cow_randomRunNoDirP=0.8;      //无意识行动者，otherwise，有方向引导的randomRun——探索者

//牛逃跑模块
const Cow_detectTiger1=4;   //牛检测有老虎的范围
const Cow_detectTiger2=6;   //牛在检测到有老虎后的扩大搜索方格
const Cow_detectWallRange=2;//牛检测墙的范围
//转向-45度
var Cow_detectWall_1=0;     //牛在检测到墙后对速度向量进行旋转映射的线性矩阵element1
var Cow_detectWall_2=0.5;   //牛在检测到墙后对速度向量进行旋转映射的线性矩阵element2
var Cow_detectWall_3=0;     //牛在检测到墙后对速度向量进行旋转映射的线性矩阵element3
var Cow_detectWall_4=-0.5;  //牛在检测到墙后对速度向量进行旋转映射的线性矩阵element4

//牛吃草模块
const Cow_BFS_range=36;//6*6方格

//全局信息
var grass_cluster=[];
var grass_cluster_x=upperBound_x/10;
var grass_cluster_y=upperBound_y/10;
var cow_cluster=[];
var cow_cluster_x=grass_cluster_x;
var cow_cluster_y=grass_cluster_y;
var tiger_cluster=[];
var tiger_cluster_x=grass_cluster_x;
var tiger_cluster_y=grass_cluster_y;

//老虎各行动执行概率
//老虎的行动分为在饥饿状态下追捕牛——越饥饿越选择近的牛(BFS)、状态尚可则选择老弱病残的牛(优先队列的BFS)，温饱状态下的行动——基于全局信息智能的移向牛草比大的区域，随机移动，保持原地不动
const Tiger_randomBehaveEnergy=45;  //tigers[i].energy-Tiger_randomBehaveEnergy 温饱状态的界定
const Tiger_randomBehaveP=0.8;      //otherwise，温饱状态下仍然寻找牛吃——贪心者
const Tiger_randomRunP=0.5;         //otherwise,stay——安逸者
const Tiger_randomRunNoDirP=0.8;    //——无意识行动者，otherwise,有方向引导的randomRun——探索者

//老虎的追捕模块
const Tiger_BFS_hungryEnergy=20;    //BFS搜索最短距离的老虎的饥饿标准
const Tiger_BFSP=0.9;               //满足饥饿标准后确实执行了BFS而非基于优先队列的BFS的概率
const Tiger_BFS_range=100;          //BFS最大扩散10*10的方格

//行动排班参数:
var order_Sun_Cloudy=[];
var order_Rain=[];
var order_Sun_Cloudy_Cowtick=0;
var order_Rain_Cowtick=0;
var order_Sun_Cloudy_Tigertick=0;
var order_Rain_Tigertick=0;

//惯性概率
const Cow_keepInertia=0.1;
const Tiger_keepInertia=0.1;

//优先队列的评价函数
function cowObjectEvaluate(Cow){
    return 0;
}


function iscollide(s1,s2)
{
   //矩形判断 一个点是否在另外一个矩形里面
    //考虑四个点
    for(var i =0;i<=1;i++)
    {
        for(var j=0;j<=1;j++)
        {
            if(inside(s1.x + i*unit, s1.y+j*unit, s2.x, s2.x+unit, s2.y, s2.y+unit))
            return true;
        }

    }
    return false;
}


//初始化草
function initGrass()
{
    grasses.splice(0,grasses.length);
    for(var i=0;i<map_matrix_x;i++)
    {
        for(var j=0;j<map_matrix_y;j++)
        {   //Math.random()*1000)%parseInt(0.1*Grass_alpha*Grass_maxAge)
            var temp=new Grass(Math.random()*1000%10);
            temp.x = i*unit;
            temp.y = j*unit;
            if(Math.random()>(1-GrassCoverRate))  
            {
                temp.live = true;
                liveGrasses++;
                grass_cluster[parseInt(temp.y/grass_cluster_y)+parseInt(temp.x/grass_cluster_x)*(parseInt(upperBound_y/grass_cluster_y))]++;
            }
            else  
            {
                temp.live=false;
            }
            grasses.push(temp);
            
        }
    }
}

//初始化牛
function initCow(cowNum)
{
    cows.splice(0,cows.length);
    for(var i=0;i<cowNum;i++)
    {
        var temp = new Cow();
        temp.x = (parseInt(Math.random()*10000)%map_matrix_x)*unit;
        temp.y = (parseInt(Math.random()*6000)%map_matrix_y)*unit;
        cows.push(temp);
        liveCows++;
        //初始化grid的cows
        grids[temp.y/unit][temp.x/unit].insertCow(temp.id);
        cow_cluster[parseInt(temp.y/cow_cluster_y)+parseInt(temp.x/cow_cluster_x)*(parseInt(upperBound_y/cow_cluster_y)+1)]++;
    }
     

}

//初始化老虎
function initTiger(tigerNum)
{
    tigers.splice(0,tigers.length);
    for(var i=0;i<tigerNum;i++)
    {
        var temp = new Tiger();
        temp.x = (parseInt(Math.random()*10000)%map_matrix_x)*unit;
        temp.y = (parseInt(Math.random()*6000)%map_matrix_y)*unit;
        tigers.push(temp);
        liveTigers++;
        //初始化grid的tigers
        grids[temp.y/unit][temp.x/unit].insertTiger(temp.id);
        tiger_cluster[parseInt(temp.y/tiger_cluster_y)+parseInt(temp.x/tiger_cluster_x)*(parseInt(upperBound_y/tiger_cluster_y)+1)]++;

    } 
     
}

//画牛，并且更新livecows
function drawCow()
{
    var flag_draw=false;
    if(temp_s_x!=-1 && temp_s_y!=-1){
        if(cows[id_f].live && svalue=="Cow"){
            context.fillStyle = color_tag;
            context.fillRect(temp_s_x,temp_s_y,unit,unit);
            flag_draw==true;
        }
    }
    liveCows=0;
    for(i in cows)
    {
        if(cows[i].live)
        {
            if(flag_draw && temp_s_x==cows[i].x && temp_s_y==cows[i].y){

            }
            else{
                context.fillStyle = color_cow;
                //cows[i].randomMove();
                context.fillRect(cows[i].x,cows[i].y,unit,unit);
                
            }
            liveCows++;
        }

    }
}

//画草，并且更新livegrass
function drawGrass()
{
    var flag_draw=false;
    if(temp_s_x!=-1 && temp_s_y!=-1){
        if(grasses[id_f].live && svalue=="Grass"){
            context.fillStyle = color_tag;
            context.fillRect(temp_s_x,temp_s_y,unit,unit);
            flag_draw==true;
        }
    }
    liveGrasses=0;
    //console.log(liveGrasses);
    for(i in grasses)
    {
        if(grasses[i].live)
        {
            if(flag_draw && temp_s_x==grasses[i].x && temp_s_y==grasses[i].y){

            }
            else{
                context.fillStyle=color_grass;
                context.fillRect(grasses[i].x,grasses[i].y,unit,unit);
                
            }
            liveGrasses++;
        }
        else{
            context.fillStyle=color_blank;
            context.fillRect(grasses[i].x,grasses[i].y,unit,unit);
        }

    }
}

//画老虎，并且更新livetiger
function drawTiger()
{
    //console.log(tigers.length)
    var flag_draw=false;
    if(temp_s_x!=-1 && temp_s_y!=-1){
        if(tigers[id_f].live && svalue=="Tiger"){
            context.fillStyle = color_tag;
            context.fillRect(temp_s_x,temp_s_y,unit,unit);
            flag_draw==true;
        }
    }
    liveTigers=0;
    for( i in tigers)
    {
        if(tigers[i].live)
        {
            if(flag_draw && temp_s_x==tigers[i].x && temp_s_y==tigers[i].y){

            }
            else{
                context.fillStyle = color_tiger;
                context.fillRect(tigers[i].x,tigers[i].y,unit,unit);
            }
            liveTigers++;
        }
    }
}


/**
 * 繁殖的策略
 * 将可能标记为死亡的个体复活 另存一个全局数组来保存 重新设置属性
 * 或者在数组中增加对象 
 */

//草的繁殖策略——死后化为空地，energy重置，在tick()函数中按指定天气的生长速度进行能量的积累
//在积累的能量达到某一limit后，以下的grassreproduce函数会让草重新长出。
//值得注意的是，由于behave的时序问题，牛吃的总是上一轮的草。但在tick()设计上，同一轮的在上一轮被吃掉的草的energy不为0而是为0+一轮的天气的生长速度
//相比之下的同一轮内死掉的草的energy为0. 即若空地到草的limit为5，生长速度为2，第1轮牛吃掉了一片草，该片草空地的energy如下：第1轮在牛behave环节被清0变为空地，
//而后在草bhave的tick()环节能量变为2，第2轮草空地的能量为4，第3轮草空地的能量为6并在末尾复苏，最早被吃掉也是第4轮的牛。而相比之下本轮自然死掉的草最早也是被
//第五轮的牛吃掉。这说明了没啥问题，fine
var deadGrassId= new linedList();
function GrassReproduce()
{
    // var temp = new Array();
    // for(i in grasses)
    // {
    //     if(!grasses[i].live)
    //     {
    //         temp.push(grasses[i].id);
    //     }
    // }
    //if(deadGrassId.totalLength()==0){return;}
    deadGrassId.setStart();
    while(deadGrassId.fence!=deadGrassId.tail)
    {
        /* if(!grasses[i].live && deadGrassId.length!=0 )
        {
            var index = parseInt(Math.random()*deadGrassId.length)%deadGrassId.length;//随处长出来
            //index = temp.shift();
            var backLiveId = deadGrassId[index];
            deadGrassId.splice(index,1);
            //console.log(index);
            grasses[backLiveId].beLive();
        } */
        if(!grasses[deadGrassId.getValue()].live && grasses[deadGrassId.getValue()].energy>=grasses[deadGrassId.getValue()].fullEnergy/Grass_fullEnergy*Grass_reproduceEnergyLimit){
            grasses[deadGrassId.getValue()].beLive();
            deadGrassId.remove();
        }
        deadGrassId.next();
    }
}


var deadTigerId=new linedList();
function TigerReproduce()
{
    // var temp = new Array();
    // for(i in tigers)
    // {
    //     if(!tigers[i].live)
    //     {
    //         temp.push(tigers[i].id);
    //     }
    // }
    for(var i=0; i<tigers.length;i++)
    {
        if(tigers[i].live&& tigers[i].age>=tigers[i].reproduceAge_lowerBound && tigers[i].age<=tigers[i].reproduceAge_upperBound && tigers[i].energy>Tiger_reproduceEnergyLimit && tigers[i].reproduceNum<Tiger_reproduceMaxNum && Math.random()<=Tiger_reproduceRate)
        {
            if(deadTigerId.totalLength()!=0)
            {
                deadTigerId.setStart();
                var index = deadTigerId.remove();
                //console.log('tiger index',index);
                tigers[index].beLive();
                if(Math.random()>0.5 && tigers[i].x!=upperBound_x-unit){
                    tigers[index].x = tigers[i].x+unit;
                }
                else if(tigers[i].x!=lowerBound_x){
                    tigers[index].x= tigers[i].x-unit;
                }
                else{
                    tigers[index].x=tigers[i].x;
                }
                if(Math.random()>0.5 && tigers[i].y!=upperBound_y-unit){
                    tigers[index].y = tigers[i].y+unit;
                }
                else if(tigers[i].y!=lowerBound_y){
                    tigers[index].y = tigers[i].y-unit;
                }
                else{
                    tigers[index].y = tigers[i].y;
                }
                //console.log(tigers[index].x);
                //console.log(tigers[index].y);
                grids[tigers[index].y/unit][tigers[index].x/unit].insertTiger(index);
                tigers[i].reproduceNum++;
                tigers[i].energy=tigers[i].energy-Tiger_reproduceEnergy;
                //console.log(tigers[i].energy,tigers.length);
            }
            else
            {
                let temp = new Tiger();
                if(Math.random()>0.5 && tigers[i].x!=upperBound_x-unit){
                    temp.x = tigers[i].x+unit;
                }
                else if(tigers[i].x!=lowerBound_x){
                    temp.x = tigers[i].x-unit;
                }
                else{
                    temp.x=tigers[i].x;
                }
                if(Math.random()>0.5 && tigers[i].y!=upperBound_y-unit){
                    temp.y = tigers[i].y+unit;
                }
                else if(tigers[i].y!=lowerBound_y){
                    temp.y = tigers[i].y-unit;
                }
                else{
                    temp.y = tigers[i].y;
                }
                tigers.push(temp);
                grids[temp.y/unit][temp.x/unit].insertTiger(temp.id);
                tigers[i].reproduceNum++;
                tigers[i].energy=tigers[i].energy-Tiger_reproduceEnergy;
                //console.log(tigers[i].energy,tigers.length);
            }

        }
    }
}

var deadCowsId=new linedList();
function CowReproduce()
{
    // var temp = new Array();
    // for(var i=0;i<cows.length;i++)
    // {
    //     if(!cows[i].live)
    //     {
    //         temp.push(cows[i].id);
    //     }
    // }
    for(var i=0;i<cows.length;i++)
    {
        
        if(cows[i].live && cows[i].age>=cows[i].reproduceAge_lowerBound && cows[i].age<=cows[i].reproduceAge_upperBound &&cows[i].energy>Cow_reproduceEnergyLimit && cows[i].reproduceNum<Cow_reproduceMaxNum && Math.random()<=Cow_reproduceRate)
        {
            
            if(deadCowsId.totalLength()!=0)
            {
                deadCowsId.setStart();
                var index = deadCowsId.remove();
                cows[index].beLive();
                //生孩子后孩子的位置在哪里？？
                if(Math.random()>0.5 && cows[i].x!=upperBound_x-unit){
                    cows[index].x = cows[i].x+unit;
                }
                else if(cows[i].x!=lowerBound_x){
                    cows[index].x= cows[i].x-unit;
                }
                else{
                    cows[index].x=cows[i].x;
                }
                if(Math.random()>0.5 && cows[i].y!=upperBound_y-unit){
                    cows[index].y = cows[i].y+unit;
                }
                else if(cows[i].y!=lowerBound_y){
                    cows[index].y = cows[i].y-unit;
                }
                else{
                    cows[index].y = cows[i].y;
                }
                grids[cows[index].y/unit][cows[index].x/unit].insertCow(index);
                cows[i].reproduceNum++;
                cows[i].energy=cows[i].energy-Cow_reproduceEnergy;
            }
            else
            {
                let temp = new Cow();
                //生孩子后孩子的位置在哪里？？
                if(Math.random()>0.5 && cows[i].x!=upperBound_x-unit){
                    temp.x = cows[i].x+unit;
                }
                else if(cows[i].x!=lowerBound_x){
                    temp.x =cows[i].x-unit;
                }
                else{
                    temp.x=cows[i].x;
                }
                if(Math.random()>0.5 && cows[i].y!=upperBound_y-unit){
                    temp.y = cows[i].y+unit;
                }
                else if(cows[i].y!=lowerBound_y){
                    temp.y = cows[i].y-unit;
                }
                else{
                    temp.y = cows[i].y;
                }
                cows.push(temp);
                grids[temp.y/unit][temp.x/unit].insertCow(temp.id);
                cows[i].reproduceNum++;
                cows[i].energy=cows[i].energy-Cow_reproduceEnergy;
            }
            //console.log("newcow")
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
    
    constructor(x,y)
    {
       this.x = x;
       this.y = y;
       this.tempCows = new BST();//储存暂时在这里的cow 的id
        this.tempTigers= new BST();//储存暂时在这里的tiger的id
        this.CowSmell=0;//cow留下的气味
        this.type=0;//是否为障碍物
    }
    deleteCow(id)//要与位置移动绑定在一起
    {
        this.tempCows.remove(id);
    }
    insertCow(id)
    {
        this.tempCows.insert(id);
    }
    isEmptyCow(){
        if(this.num_tempCows()==0){
            return true;
        }
        else{
            return false;
        }
    }
    firstCow(){
        return this.tempCows.max(this.tempCows.root).data;
    }
    num_tempCows(){
        return this.tempCows.length();
    }
    clear_tempCows(){
        this.tempCows=new BST();
    }

    deleteTiger(id)//要与位置移动绑定在一起
    {
        this.tempTigers.remove(id);
    }
    insertTiger(id)
    {
        this.tempTigers.insert(id);
    }
    isEmptyTiger(){
        if(this.num_tempTigers()==0){
            return true;
        }
        else{
            //console.log(this.x,this.y,this.tempTigers.length())
            return false;
        }
    }
    num_tempTigers(){
        
        return this.tempTigers.length();
    }
    clear_tempTigers(){
        this.tempTigers=new BST();
    }
}

//创建一个方格的二维数组
var grids = new Array();
for(var i=0;i<map_matrix_y;i++)
{
    grids[i] = new Array();
    for(var j=0;j<map_matrix_x;j++)
    {
        var temp = new grid(j*unit,i*unit);
        temp.type = 0;
        grids[i].push(temp);
    }
}

//console.log(grids[4][3]);
//障碍物的位置
var barriers = [
    [41*unit,51*unit],

[44*unit,62*unit],
[44*unit,63*unit],
[44*unit,64*unit],
[44*unit,65*unit],
[45*unit,51*unit],
[45*unit,52*unit],



[47*unit,53*unit],
[47*unit,54*unit],
[47*unit,55*unit],
[47*unit,56*unit],



[50*unit,56*unit],
[50*unit,57*unit],
[50*unit,58*unit],
[50*unit,59*unit],
[50*unit,60*unit],
[50*unit,61*unit],
[50*unit,62*unit],
[50*unit,63*unit],
[50*unit,64*unit],
[50*unit,65*unit],
[97*unit,88*unit],
[18*unit,136*unit],
[112*unit,15*unit],
[121*unit,147*unit],
[17*unit,19*unit],
[123*unit,86*unit],
[22*unit,122*unit],
[70*unit,44*unit],
[109*unit,19*unit],
[85*unit,92*unit],
[89*unit,148*unit],
[137*unit,108*unit],
[145*unit,123*unit],
[63*unit,18*unit],
[34*unit,7*unit],
[24*unit,142*unit],
[132*unit,99*unit],
[72*unit,28*unit],
[77*unit,105*unit],
[100*unit,15*unit],
[88*unit,137*unit],
[136*unit,38*unit],
[145*unit,16*unit],
[99*unit,142*unit],
[101*unit,44*unit],
[38*unit,90*unit],
[65*unit,19*unit],
[84*unit,21*unit],
[96*unit,133*unit],
[16*unit,32*unit],
[97*unit,92*unit],
[127*unit,102*unit],
[21*unit,39*unit],
[126*unit,25*unit],
[30*unit,146*unit],
[121*unit,135*unit],
[8*unit,28*unit],
[76*unit,9*unit],
[124*unit,29*unit],
[35*unit,149*unit],
[77*unit,76*unit],
[127*unit,20*unit],
[23*unit,3*unit],
[29*unit,93*unit],
[62*unit,136*unit],
[19*unit,112*unit],
[99*unit,91*unit],
[103*unit,126*unit],
[61*unit,138*unit],
[13*unit,144*unit],
[35*unit,16*unit],
[62*unit,77*unit],
[90*unit,11*unit],
[81*unit,96*unit],
[126*unit,101*unit],
[76*unit,147*unit],
[57*unit,109*unit],
[26*unit,21*unit],
[39*unit,139*unit],
[1*unit,72*unit],
[19*unit,19*unit],
[118*unit,85*unit],
[18*unit,18*unit],
[100*unit,72*unit],
[144*unit,5*unit],
[111*unit,121*unit],
[107*unit,43*unit],
[73*unit,122*unit],
[8*unit,139*unit],
[106*unit,26*unit],
[141*unit,10*unit],
[110*unit,118*unit],
[37*unit,105*unit],
[67*unit,17*unit],
[106*unit,135*unit],
[78*unit,130*unit],
[114*unit,149*unit],
[76*unit,87*unit],
[147*unit,28*unit],
[24*unit,120*unit],
[95*unit,134*unit],
[106*unit,87*unit],
[71*unit,118*unit],
[12*unit,89*unit],
[85*unit,42*unit],
[91*unit,18*unit],
[76*unit,48*unit],
[125*unit,87*unit],
[135*unit,140*unit],
[69*unit,98*unit],
[57*unit,81*unit],
[121*unit,25*unit],
[126*unit,90*unit],
[22*unit,7*unit],
[82*unit,48*unit],
[61*unit,101*unit],
[120*unit,46*unit],
[77*unit,125*unit],
[67*unit,145*unit],
[138*unit,46*unit],
[11*unit,111*unit],
[9*unit,96*unit],
[81*unit,49*unit],
[143*unit,94*unit],
[117*unit,140*unit],
[128*unit,78*unit],
[121*unit,8*unit],
[84*unit,111*unit],
[19*unit,84*unit],
[2*unit,136*unit],
[99*unit,146*unit],
[114*unit,29*unit],
[63*unit,17*unit],
[25*unit,110*unit],
[82*unit,32*unit],
[111*unit,48*unit],
[134*unit,138*unit],
[37*unit,104*unit],
[106*unit,14*unit],
[16*unit,106*unit],
[77*unit,3*unit],
[131*unit,30*unit],
[149*unit,32*unit],
[137*unit,106*unit],
[65*unit,124*unit],
[102*unit,15*unit],
[33*unit,122*unit],
[39*unit,31*unit],
[84*unit,46*unit],
[56*unit,134*unit],
[32*unit,94*unit],
[69*unit,72*unit],
[61*unit,48*unit],
[97*unit,5*unit],
[135*unit,106*unit],
[96*unit,136*unit],
[69*unit,1*unit],
[59*unit,18*unit],
[71*unit,49*unit],
[79*unit,122*unit],
[135*unit,122*unit],
[66*unit,22*unit],
[106*unit,144*unit],
[67*unit,74*unit],
[13*unit,125*unit],
[83*unit,41*unit],
[20*unit,131*unit],
[23*unit,98*unit],
[57*unit,22*unit],
[75*unit,46*unit],
[106*unit,34*unit],
[57*unit,42*unit],
[26*unit,6*unit],
[83*unit,101*unit],
[60*unit,103*unit],
[74*unit,123*unit],
[82*unit,97*unit],
[121*unit,80*unit],
[116*unit,35*unit],
[107*unit,147*unit],
[13*unit,113*unit],
[22*unit,85*unit],
[33*unit,84*unit],
[70*unit,24*unit],
[15*unit,37*unit],
[83*unit,28*unit],
[21*unit,145*unit],
[111*unit,97*unit],
[100*unit,95*unit],
[84*unit,74*unit],
[15*unit,90*unit],
[144*unit,84*unit],
[7*unit,79*unit],
[120*unit,44*unit],
[24*unit,26*unit],
[146*unit,89*unit],
[139*unit,31*unit],
[7*unit,10*unit],
[148*unit,134*unit],
[81*unit,45*unit],
[119*unit,11*unit],
[109*unit,14*unit],
[115*unit,0*unit],
[66*unit,135*unit],
[2*unit,125*unit],
[127*unit,98*unit],
[79*unit,43*unit],
[73*unit,74*unit],
[72*unit,7*unit],
[15*unit,19*unit],
[73*unit,49*unit],
[145*unit,36*unit],
[123*unit,43*unit],
[97*unit,146*unit],
[33*unit,28*unit],
[12*unit,101*unit],
[56*unit,81*unit],
[19*unit,18*unit],
[120*unit,144*unit],
[114*unit,148*unit]
];

function drawBarrier()
{
    for(i in barriers)
    {
        context.fillStyle=color_barrier;
        context.fillRect(barriers[i][0],barriers[i][1],unit,unit);
        grids[barriers[i][1]/unit][barriers[i][0]/unit].type = Barrier;
    }
}



//BFS专用
class node
{
    constructor(){

        this.x=0;
        this.y=0;//对应是像素点的位置
        this.f=0;
        // this.g=0;
        // this.h=0;//f = g + h;评价函数用来指导bfs
        this.type=0;
        this.is_open=false;
        //is_close;
        //this.road;
        this.parent=null;
        //this.visited;

    }
    // CowSmell(){
    //     return  grid(this.x,this.y).CowSmell;
    // }

}



var dir = [[1,0],[0,1],[-1,0],[0,-1]];//右，下，左，上



//创建地图 这里消耗了大量的空间
var map = new Array();
for(var i=0;i<map_matrix_y;i++)
{
    map[i] = new Array();
    for(var j=0;j<map_matrix_x;j++)
    {
        map[i][j] = new node(); 
        map[i][j].x = j*unit;
        map[i][j].y = i*unit;
        map[i][j].type = grids[i][j].type;
        //map[i][j].is_close = map[i][j].is_open = false;
    }
}

//包含找猎物，找不到后的随机运动，找到后的跟踪
function TigerBFS(id,dx,dy)//初始的x,y
{
    //搜索最近的牛

    var needRecover=[];
    //BFS
    var road = [];
    var open = new queue();
    var temp_connt=0;

    // var test_bool=false;
    // for(var i=0;i<map_matrix_y;i++){
    //     for(var j=0;j<map_matrix_x;j++){
    //         if(map[i][j].is_open){
    //             test_bool=true;
    //         }
    //     }
    // }

    map[dy/unit][dx/unit].type = Start;
    open.push(map[dy/unit][dx/unit]);
    map[dy/unit][dx/unit].is_open = true;
    needRecover.push(map[dy/unit][dx/unit]);
    
    
    //console.log("onetime:",test_bool,dx,dy);

    while(!open.empty())
    {
        var temp = open.pop();
        temp_connt++;
        //console.log(temp.x,temp.y);
        if(!grids[temp.y/unit][temp.x/unit].isEmptyCow())
        {
            var nx=temp.x/unit;
            var ny=temp.y/unit;
            
            while(map[ny][nx].type!=Start)
            {
                    //map[ny][nx].road=6;
                road.push([nx,ny]);
                var t = new node();
                t = map[ny][nx].parent;
                nx = t.x/unit;
                ny = t.y/unit;
            }
            break;
        }
        //扩散
        for(var i=0;i<4;i++)
        {
            var nextX = temp.x + dir[i][0]*unit;
            var nextY = temp.y + dir[i][1]*unit;
            //console.log(inside(nextX,nextY,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit) );
            //console.log(nextX,nextY)
            //console.log(!map[nextY/unit][nextX/unit].is_open)
            //console.log(map[nextY/unit][nextX/unit].type!=Barrier)
            if (inside(nextX,nextY,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit) && !(map[nextY/unit][nextX/unit].is_open) && map[nextY/unit][nextX/unit].type!=Barrier){
                //console.log("in")
                //console.log(nextX,nextY);
                map[nextY/unit][nextX/unit].parent = map[temp.y/unit][temp.x/unit];
                map[nextY/unit][nextX/unit].is_open = true;
                needRecover.push(map[nextY/unit][nextX/unit]);
                open.push(map[nextY/unit][nextX/unit]);
                //console.log(1);
            }
        }
        
        //BFS扩散出大方块
        //console.log(open)
        //console.log(temp_connt);
        if(temp_connt>=Tiger_BFS_range){
            map[dy/unit][dx/unit].type = 0;
            for(var i =0;i<needRecover.length;i++){
                needRecover[i].is_open = false;
            }
            return false;
        }
    }

    // if(road.length==0 && grids[dy/unit][dx/unit].isEmptyCow()){
    //     map[dy/unit][dx/unit].type = 0;
    //     for(var i =0;i<needRecover.length;i++){
    //         needRecover[i].is_open = false;
    //     }
    //     return true;
    // }

    //console.log("A");
    //console.log(needRecover.length);
    //console.log(road.length);
    if(road.length==0)//直接扑过去把牛吃了——原地
    {
        //console.log("eat");
        //console.log(dx,dy);
        var target=grids[dy/unit][dx/unit].firstCow();
        //var l=grids[dy/unit][dx/unit].num_tempCows();
        tigers[id].eatCow(cows[target]);
        //console.log(target,id,cows[target].x,cows[target].y,dx,dy,grids[dy/unit][dx/unit].tempCows.root.data,target,l,grids[dy/unit][dx/unit].num_tempCows(),tigers[id].energy,cows[target].cost_of_prey)
        
    }
    else if(road.length==1)//直接扑过去把牛吃了——一格
   {
    //console.log("eat");
        var target_x=road[0][0];
        var target_y=road[0][1];
        //console.log(target_x);
        //console.log(target_y);
        var target=grids[target_y][target_x].firstCow();
        //可以选能量大的来吃
        //console.log(target);
       tigers[id].eatCow(cows[target]);
       grids[tigers[id].y/unit][tigers[id].x/unit].deleteTiger(id);
       var vc_x=(road[road.length-1][0]*unit-tigers[id].x)/unit;
        var vc_y=(road[road.length-1][1]*unit-tigers[id].y)/unit;
        if(vc_x==1 && vc_y==0){
            tigers[id].dir=RIGHT;
        }
        else if(vc_x==-1 && vc_y==0){
            tigers[id].dir=LEFT;
        }
        else if(vc_x==0 && vc_y==1){
            tigers[id].dir=DOWN;
        }
        else if(vc_x==0 && vc_y==-1){
            tigers[id].dir=UP;
        }
        tigers[id].move(TIGER);
       grids[tigers[id].y/unit][tigers[id].x/unit].insertTiger(id);
   }
   else
   { 
        //console.log("runing");
       grids[tigers[id].y/unit][tigers[id].x/unit].deleteTiger(id);
        var vc_x=(road[road.length-1][0]*unit-tigers[id].x)/unit;
        var vc_y=(road[road.length-1][1]*unit-tigers[id].y)/unit;
        if(vc_x==1 && vc_y==0){
            tigers[id].dir=RIGHT;
        }
        else if(vc_x==-1 && vc_y==0){
            tigers[id].dir=LEFT;
        }
        else if(vc_x==0 && vc_y==1){
            tigers[id].dir=DOWN;
        }
        else if(vc_x==0 && vc_y==-1){
            tigers[id].dir=UP;
        }
        tigers[id].move(TIGER);
       grids[tigers[id].y/unit][tigers[id].x/unit].insertTiger(id);
   }

   //恢复初始
   map[dy/unit][dx/unit].type = 0;
   for(var i =0;i<needRecover.length;i++){
       needRecover[i].is_open = false;
   }
   return true;
}

//优先队列实现的BFS
function TigerBFS_priorQueue(id,dx,dy)//初始的x,y
{
    //搜索最近的牛

    var needRecover=[];
    //BFS
    var road = [];
    var open = new Maxheap();
    var temp_connt=0;

    map[dy/unit][dx/unit].type = Start;
    open.insert(map[dy/unit][dx/unit]);
    map[dy/unit][dx/unit].is_open = true;
    needRecover.push(map[dy/unit][dx/unit]);
    
    
    //console.log("onetime:",test_bool,dx,dy);

    while(!open.empty())        //open队列中有值
    {
        var temp = open.remove();  //弹出第一个值
        temp_connt++;
        //console.log(temp.x,temp.y);
        if(!grids[temp.y/unit][temp.x/unit].isEmptyCow())   //说明在该方格中有牛
        {
            var nx=temp.x/unit;     //非单位变量x
            var ny=temp.y/unit;     //非单位变量y
            
            while(map[ny][nx].type!=Start)      //如果该值不为start值
            {
                    //map[ny][nx].road=6;
                road.push([nx,ny]);     //在路径加入该点
                var t = new node();     //新建点
                t = map[ny][nx].parent; //作为该点的父节点
                nx = t.x/unit;
                ny = t.y/unit;
            }
            break;
        }
        //扩散
        for(var i=0;i<4;i++)
        {
            var nextX = temp.x + dir[i][0]*unit;
            var nextY = temp.y + dir[i][1]*unit;        //四个方向
            //console.log(inside(nextX,nextY,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit) );
            //console.log(nextX,nextY)
            //console.log(!map[nextY/unit][nextX/unit].is_open)
            //console.log(map[nextY/unit][nextX/unit].type!=Barrier)
            if (inside(nextX,nextY,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit) && !(map[nextY/unit][nextX/unit].is_open) && map[nextY/unit][nextX/unit].type!=Barrier){
                //console.log("in")
                //console.log(nextX,nextY);
                map[nextY/unit][nextX/unit].parent = map[temp.y/unit][temp.x/unit];
                map[nextY/unit][nextX/unit].is_open = true;
                map[nextY/unit][nextX/unit].f=grids[nextY/unit][nextX/unit].CowSmell
                needRecover.push(map[nextY/unit][nextX/unit]);      //在需要搜寻的点中加入子节点
                open.insert(map[nextY/unit][nextX/unit]);             //在已经搜索完的点中加入父节点
                //console.log(1);
            }
        }
        
        //BFS扩散出大方块
        //console.log(open)
        //console.log(temp_connt);
        if(temp_connt>=Tiger_BFS_range){
            map[dy/unit][dx/unit].type = 0;
            for(var i =0;i<needRecover.length;i++){
                needRecover[i].is_open = false;
            }
            return false;
        }
    }

    if(road.length==0)//直接扑过去把牛吃了——原地
    {
        var target=grids[dy/unit][dx/unit].firstCow();
        tigers[id].eatCow(cows[target]);     
    }
    else if(road.length==1)//直接扑过去把牛吃了——一格
   {
    //console.log("eat");
        var target_x=road[0][0];
        var target_y=road[0][1];
        //console.log(target_x);
        //console.log(target_y);
        var target=grids[target_y][target_x].firstCow();
        //可以选能量大的来吃
        //console.log(target);
       tigers[id].eatCow(cows[target]);
       grids[tigers[id].y/unit][tigers[id].x/unit].deleteTiger(id);
       var vc_x=(road[road.length-1][0]*unit-tigers[id].x)/unit;
        var vc_y=(road[road.length-1][1]*unit-tigers[id].y)/unit;
        if(vc_x==1 && vc_y==0){
            tigers[id].dir=RIGHT;
        }
        else if(vc_x==-1 && vc_y==0){
            tigers[id].dir=LEFT;
        }
        else if(vc_x==0 && vc_y==1){
            tigers[id].dir=DOWN;
        }
        else if(vc_x==0 && vc_y==-1){
            tigers[id].dir=UP;
        }
        tigers[id].move(TIGER);
       grids[tigers[id].y/unit][tigers[id].x/unit].insertTiger(id);
   }
   else
   { 
        //console.log("runing");
       grids[tigers[id].y/unit][tigers[id].x/unit].deleteTiger(id);
        var vc_x=(road[road.length-1][0]*unit-tigers[id].x)/unit;
        var vc_y=(road[road.length-1][1]*unit-tigers[id].y)/unit;
        if(vc_x==1 && vc_y==0){
            tigers[id].dir=RIGHT;
        }
        else if(vc_x==-1 && vc_y==0){
            tigers[id].dir=LEFT;
        }
        else if(vc_x==0 && vc_y==1){
            tigers[id].dir=DOWN;
        }
        else if(vc_x==0 && vc_y==-1){
            tigers[id].dir=UP;
        }
        tigers[id].move(TIGER);
       grids[tigers[id].y/unit][tigers[id].x/unit].insertTiger(id);
   }

   //恢复初始
   map[dy/unit][dx/unit].type = 0;
   for(var i =0;i<needRecover.length;i++){
       needRecover[i].is_open = false;
   }
   return true;
}

//
function CowEscapce(id) 
{
    var x=cows[id].x;
    var y=cows[id].y;
    var enemy=[];//坐标
    var range1 = Cow_detectTiger1;
    for(var i=-range1;i<=range1;i++)
    {
        for(var j=-range1;j<=range1;j++)
        {
            var nextX = x+i*unit;
            var nextY = y+j*unit;
            //console.log(x);
            //console.log(y);
            if(inside(nextX,nextY,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit)&& !grids[nextY/unit][nextX/unit].isEmptyTiger())
            {
                enemy.push([nextX,nextY]);
    
            }
        }
    }
    //不需要跑
    if(enemy.length==0) {
        
        return false;
    }

    //console.log(1)
    //要跑，扩大搜索方格
    var range2=Cow_detectTiger2;
    for(var i=-range2;i<-range1;i++)
    {
        for(var j=-range2;j<=range2;j++){
            var nextX=x+i*unit;
            var nextY=y+j*unit;
            if(inside(nextX,nextY,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit)&& !grids[nextY/unit][nextX/unit].isEmptyTiger())
            {
                enemy.push([nextX,nextY]);
            }
        }
    }
    for(var i=range1+1;i<=range2;i++)
    {
        for(var j=-range2;j<=range2;j++){
            var nextX=x+i*unit;
            var nextY=y+j*unit;
            if(inside(nextX,nextY,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit)&& !grids[nextY/unit][nextX/unit].isEmptyTiger())
            {
                enemy.push([nextX,nextY]);
            }
        }
    }
    for(var i=-range1;i<=range1;i++)
    {
        for(var j=range1+1;j<=range2;j++){
            var nextX=x+i*unit;
            var nextY=y+j*unit;
            if(inside(nextX,nextY,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit)&& !grids[nextY/unit][nextX/unit].isEmptyTiger())
            {
                enemy.push([nextX,nextY]);
            }
        }
    }
    for(var i=-range1;i<=range1;i++)
    {
        for(var j=-range2;j<-range1;j++){
            var nextX=x+i*unit;
            var nextY=y+j*unit;
            if(inside(nextX,nextY,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit)&& !grids[nextY/unit][nextX/unit].isEmptyTiger())
            {
                enemy.push([nextX,nextY]);
            }
        }
    }


    //计算逃跑向量
    var escX=0;
    var escY=0;
    for(var i=0;i<enemy.length;i++)
    {
        escX+=x-enemy[i][0];
        escY+=y-enemy[i][1];
    }
    //console.log(escX,escY)

    //绝路（墙）对牛逃跑向量的影响——旋转偏移
    var flag1=inside(x-Cow_detectWallRange*unit,y-Cow_detectWallRange*unit,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit);
    var flag2=inside(x+Cow_detectWallRange*unit,y-Cow_detectWallRange*unit,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit);
    var flag3=inside(x-Cow_detectWallRange*unit,y+Cow_detectWallRange*unit,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit);
    var flag4=inside(x+Cow_detectWallRange*unit,y+Cow_detectWallRange*unit,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit);
    if(flag1&&flag2&&flag3&&flag4){
        var temp_escX=Cow_detectWall_1*escX+Cow_detectWall_2*escY;
        var temp_escY=Cow_detectWall_3*escX+Cow_detectWall_4*escY;
        //向量叉乘矩阵运算
        escX=temp_escX;
        escY=temp_escY;
    }


    if(escX==0 && escY==0)//零向量则随机移动
    {
        grids[cows[id].y/unit][cows[id].x/unit].deleteCow(id);
        cows[id].randomMove(COW);
        grids[cows[id].y/unit][cows[id].x/unit].insertCow(id);
    }
    else
    {
        var flag = false;
        grids[cows[id].y/unit][cows[id].x/unit].deleteCow(id);
        if(Math.abs(escX)>Math.abs(escY))
        {
            if(escX<0 && check_dir(x,y,LEFT))
            {
                cows[id].dir = LEFT;
                flag = true;
            }
            else if(check_dir(x,y,RIGHT))
            {
                cows[id].dir = RIGHT;
                flag = true;
            }
        }
        if(!flag)
        {
            if(escY<0&& check_dir(x,y,DOWN))
            {
                cows[id].dir = DOWN;
                flag = true;
            }
            else if(check_dir(x,y,UP))
            {
                cows[id].dir = UP;
                flag =true;
            }
        }
        if(flag){
            cows[id].move(COW);
        }
        else
        {
            cows[id].randomMove(COW);
        }
        grids[cows[id].y/unit][cows[id].x/unit].insertCow(id);
    }
    return true;
}


function CowFindGrass(id)
{
    // //优先吃脚下的草
    // iden = (cows[id].x/unit)*map_matrix_y+(cows[id].y/unit);
    // if(cows[id].eatGrass(grasses[iden]))
    // {   
    //     return;
    // }
    // //搜索附近的草
    // var pos_array=[];
    // //Right
    // if(inside(cows[id].x + unit, cows[id].y, lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit))
    // {
    //     iden = (cows[id].x/unit +1)*map_matrix_y+(cows[id].y/unit);
    //     pos_array.push(iden);
    // }
    // //Left
    // if(inside(cows[id].x - unit, cows[id].y, lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit))
    // {
    //     iden = (cows[id].x/unit -1)*map_matrix_y+(cows[id].y/unit);
    //     pos_array.push(iden);
    // }
    // //Up
    // if(inside(cows[id].x , cows[id].y- unit, lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit))
    // {
    //     iden = (cows[id].x/unit )*map_matrix_y+(cows[id].y/unit-1);
    //     pos_array.push(iden);
    // }
    // //Down
    // if(inside(cows[id].x , cows[id].y+ unit, lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit))
    // {
    //     iden = (cows[id].x/unit )*map_matrix_y+(cows[id].y/unit+1);
    //     pos_array.push(iden);
    // }
       
    // //做了一个类似环形链表的处理，使牛可以随机找到合适的草方块吃
    // for(var i=parseInt(Math.random()*pos_array.length)%pos_array.length,count=0;count<pos_array.length;i=(i+1)%pos_array.length,count++)
    // {
    //    // console.log(i)
    //     var iden = pos_array[i];
    //     if(grasses[iden].live && check_dir(cows[id].x,cows[id].y,dir))
    //     {
    //         grids[cows[id].y/unit][cows[id].x/unit].deleteCow(cows[id].id);
    //         cows[id].eatGrass(grasses[iden]);
    //         cows[id].x=grasses[iden].x;
    //         cows[id].y=grasses[iden].y;
    //         cows[id].energy-=run_unit;
    //         grids[cows[id].y/unit][cows[id].x/unit].insertCow(cows[id].id);
    //         return;
    //     }
    // }
    // grids[cows[id].y/unit][cows[id].x/unit].deleteCow(cows[id].id);
    // cows[id].moveToGrass(grass_cluster,cow_cluster);
    // //console.log("suiji");
    // grids[cows[id].y/unit][cows[id].x/unit].insertCow(cows[id].id);

        var dy=cows[id].y;
        var dx=cows[id].x;
        
        var needRecover=[];
        //BFS
        var road = [];
        var open = new queue();
        var temp_connt=0;
    
        // var test_bool=false;
        // for(var i=0;i<map_matrix_y;i++){
        //     for(var j=0;j<map_matrix_x;j++){
        //         if(map[i][j].is_open){
        //             test_bool=true;
        //         }
        //     }
        // }
    
        map[dy/unit][dx/unit].type = Start;
        open.push(map[dy/unit][dx/unit]);
        map[dy/unit][dx/unit].is_open = true;
        needRecover.push(map[dy/unit][dx/unit]);
        
        //console.log("onetime:",test_bool,dx,dy);
    
        while(!open.empty())
        {
            var temp = open.pop();
            temp_connt++;
            //console.log(temp.x,temp.y);
            
            if(grasses[temp.y/unit+temp.x/unit*map_matrix_y].live)
            {
                var nx=temp.x/unit;
                var ny=temp.y/unit;
                
                while(map[ny][nx].type!=Start)
                {
                        //map[ny][nx].road=6;
                    road.push([nx,ny]);
                    var t = new node();
                    t = map[ny][nx].parent;
                    nx = t.x/unit;
                    ny = t.y/unit;
                }
                break;
            }
            //扩散
            for(var i=0;i<4;i++)
            {
                var nextX = temp.x + dir[i][0]*unit;
                var nextY = temp.y + dir[i][1]*unit;
                //console.log(inside(nextX,nextY,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit) );
                //console.log(nextX,nextY)
                //console.log(!map[nextY/unit][nextX/unit].is_open)
                //console.log(map[nextY/unit][nextX/unit].type!=Barrier)
                if (inside(nextX,nextY,lowerBound_x,upperBound_x-unit,lowerBound_y,upperBound_y-unit) && !(map[nextY/unit][nextX/unit].is_open) && map[nextY/unit][nextX/unit].type!=Barrier){
                    //console.log("in")
                    //console.log(nextX,nextY);
                    map[nextY/unit][nextX/unit].parent = map[temp.y/unit][temp.x/unit];
                    map[nextY/unit][nextX/unit].is_open = true;
                    needRecover.push(map[nextY/unit][nextX/unit]);
                    open.push(map[nextY/unit][nextX/unit]);
                    //console.log(1);
                }
            }
            
            //BFS扩散出大方块
            //console.log(open)
            //console.log(temp_connt);
            if(temp_connt>=Cow_BFS_range){
                map[dy/unit][dx/unit].type = 0;
                for(var i =0;i<needRecover.length;i++){
                    needRecover[i].is_open = false;
                }
                grids[cows[id].y/unit][cows[id].x/unit].deleteCow(id);
                
                cows[id].moveToGrass(grass_cluster,cow_cluster);
                grids[cows[id].y/unit][cows[id].x/unit].insertCow(id);
                return ;
            }
        }
    

        if(road.length==0)//直接扑过去把草吃了——原地
        {
            //console.log("eat");
            var target=grasses[dy/unit+dx/unit*map_matrix_y];
            //console.log(target);
            cows[id].eatGrass(target);
        }
        else if(road.length==1)//直接扑过去把草吃了——一格
       {
        //console.log("eat");
            var target_x=road[0][0];
            var target_y=road[0][1];
            //console.log(target_x);
            //console.log(target_y);
            var target=grasses[target_y+target_x*map_matrix_y];
            //可以选能量大的来吃
            //console.log(target);
           cows[id].eatGrass(target);
           grids[cows[id].y/unit][cows[id].x/unit].deleteCow(id);
           
           var vc_x=(road[road.length-1][0]*unit-cows[id].x)/unit;
           var vc_y=(road[road.length-1][1]*unit-cows[id].y)/unit;
           if(vc_x==1 && vc_y==0){
               cows[id].dir=RIGHT;
           }
           else if(vc_x==-1 && vc_y==0){
               cows[id].dir=LEFT;
           }
           else if(vc_x==0 && vc_y==1){
                cows[id].dir=DOWN;
           }
           else if(vc_x==0 && vc_y==-1){
                cows[id].dir=UP;
           }
           cows[id].move(COW);
           grids[cows[id].y/unit][cows[id].x/unit].insertCow(id);
       }
       else
       { 
            //console.log("runing");
           grids[cows[id].y/unit][cows[id].x/unit].deleteCow(id);
            var vc_x=(road[road.length-1][0]*unit-cows[id].x)/unit;
            var vc_y=(road[road.length-1][1]*unit-cows[id].y)/unit;
            if(vc_x==1 && vc_y==0){
                cows[id].dir=RIGHT;
            }
            else if(vc_x==-1 && vc_y==0){
                cows[id].dir=LEFT;
            }
            else if(vc_x==0 && vc_y==1){
                cows[id].dir=DOWN;
            }
            else if(vc_x==0 && vc_y==-1){
                cows[id].dir=UP;
            }
            cows[id].move(COW);
           grids[cows[id].y/unit][cows[id].x/unit].insertCow(id);
       }
    
       //恢复初始
       map[dy/unit][dx/unit].type = 0;
       for(var i =0;i<needRecover.length;i++){
           needRecover[i].is_open = false;
       }
       return ;



}


function Cow_behave(flag_informationUpdate,flag_tick){
    //对于牛的运动
    /**
     * 如果能量足够就随机移动或者繁殖否则找草吃
     * 如果需要逃跑则逃跑
     * 生命时钟tick
     */
     var temp_cow_cluster=[];
    if(flag_informationUpdate){
        for(var i=0;i<parseInt(upperBound_x/cow_cluster_x);i++){
            for (var j=0;j<parseInt(upperBound_y/cow_cluster_y);j++){
                temp_cow_cluster.push(0);
            }
        }
    }
    for(var i =0;i<cows.length;i++)
    {
        if(cows[i].live)
        {
            if(flag_informationUpdate){
                temp_cow_cluster[parseInt(cows[i].y/cow_cluster_y)+parseInt(cows[i].x/cow_cluster_x)*(parseInt(upperBound_y/cow_cluster_y))]++;
            }
            //console.log("a",i)
            //var temp_x=cows[i].x;
            //var temp_y=cows[i].y;
            if(Math.random()<Cow_keepInertia && check_dir(cows[i].x,cows[i].y,cows[i].dir)){
                grids[cows[i].y / unit][cows[i].x / unit].deleteCow(cows[i].id);
                
                cows[i].move(COW);
                grids[cows[i].y / unit][cows[i].x / unit].insertCow(cows[i].id);
                if(grasses[cows[i].y/unit+cows[i].x/unit*map_matrix_y].live){
                    cows[i].eatGrass(grasses[cows[i].y/unit+cows[i].x/unit*map_matrix_y]);
                }
            }
            else{
                if(Math.random() <= Cow_escapceP && CowEscapce(i))
                {
                    
                    //会自动执行逃跑
                    //console.log("pao");
                }
                else
                {
                    //温饱状态下的自由走动
                    if (cows[i].energy > cows[i].maxEnergy - Cow_randomBehaveEnergy && Math.random() < Cow_randomBehaveP) {
                        //温饱状态下由于移动或扣除能量，因此存在概率他会保持stay
                        if (Math.random() <= Cow_randomRunP) {//移动
                            if(Math.random()<=Cow_randomRunNoDirP){//随机移动
                                grids[cows[i].y / unit][cows[i].x / unit].deleteCow(cows[i].id);
                                
                                cows[i].randomMove(COW);
                                //console.log("suiji");
                                grids[cows[i].y / unit][cows[i].x / unit].insertCow(cows[i].id);
                            }
                            else{
                                grids[cows[i].y / unit][cows[i].x / unit].deleteCow(cows[i].id);
                                
                                
                                cows[i].moveToGrass(grass_cluster,cow_cluster);
                                //console.log("suiji");
                                grids[cows[i].y / unit][cows[i].x / unit].insertCow(cows[i].id);
                                
                            }
                            
                        }
                        else {
                            //stay
                        }
                    }
                    else
                    {
                        //console.log(1);
                        CowFindGrass(i);//找草吃
                        //console.log("chicoa");
                    }
                }
            }
            //console.log(cows[i].x,cow[i].y,temp_x,temp_y)
            if(flag_tick){
                cows[i].tick();
                //console.log("tick")
            }
            else{
                
                if(cows[i].checkEnergy()){grids[cows[i].y/unit][cows[i].x/unit].deleteCow(cows[i].id);}
            }
        }
        else
        {
            deadCowsId.append(i);
            
        }
    }
    if(flag_informationUpdate){
        cow_cluster=temp_cow_cluster;
    }
    //对于可能的情况进行繁殖
    CowReproduce();

}

function Tiger_behave(flag_informationUpdate,flag_tick){
    //对于老虎的运动
    /**
     * 如果能量足够就随机移动或者繁殖否则就捕捉牛
     * 生命时钟tick
     */
     var temp_tiger_cluster=[]
    if(flag_informationUpdate){
        
        for(var i=0;i<parseInt(upperBound_x/tiger_cluster_x);i++){
            for (var j=0;j<parseInt(upperBound_y/tiger_cluster_y);j++){
                temp_tiger_cluster.push(0);
            }
        }
    }
    for(var i=0;i<tigers.length;i++)
    {
        if(tigers[i].live)
        {
            //console.log(tigers[i].y);
            if(flag_informationUpdate){
                temp_tiger_cluster[parseInt(tigers[i].y/tiger_cluster_y)+parseInt(tigers[i].x/tiger_cluster_x)*(parseInt(upperBound_y/tiger_cluster_y))]++;
            }
            //console.log(tigers[i].x,"每次的x")
            //console.log(tigers[i].y,"每次的y")

            if(Math.random()<Tiger_keepInertia && check_dir(tigers[i].x,tigers[i].y,tigers[i].dir)){//保持惯性
                grids[tigers[i].y/unit][tigers[i].x/unit].deleteTiger(tigers[i].id);
                tigers[i].move(TIGER);
                grids[tigers[i].y/unit][tigers[i].x/unit].insertTiger(tigers[i].id);
                if(!grids[tigers[i].y/unit][tigers[i].x/unit].isEmptyCow()){
                    var target=grids[tigers[i].y/unit][tigers[i].x/unit].firstCow();
                    tigers[i].eatCow(cows[target]);
                }
            }
            else{
                var flag=true;
                if(!(tigers[i].energy>tigers[i].maxEnergy-Tiger_randomBehaveEnergy && Math.random()<Tiger_randomBehaveP))
                {
                    if(tigers[i].energy>Tiger_BFS_hungryEnergy&&Math.random()<Tiger_BFSP){
                        //console.log("BFS",tigers[i].x,tigers[i].y);
                        flag=TigerBFS(i,tigers[i].x,tigers[i].y);
                        //console.log(flag,tigers[i].x,tigers[i].y);
                    }
                    else{
                        //console.log("BFS",tigers[i].x,tigers[i].y);
                        //flag=TigerBFS(i,tigers[i].x,tigers[i].y);
                        flag=TigerBFS_priorQueue(i,tigers[i].x,tigers[i].y);
                        //console.log(flag,tigers[i].x,tigers[i].y);
                        //TigerBFS_priorQueue(i,tigers[i].x,tigers[i].y);
                    }
                    if(flag==false){
                        grids[tigers[i].y/unit][tigers[i].x/unit].deleteTiger(tigers[i].id);
                        //console.log(flag,"MoveToCow",tigers[i].y,tigers[i].x);
                        tigers[i].moveToCow(cow_cluster,tiger_cluster);
                        grids[tigers[i].y/unit][tigers[i].x/unit].insertTiger(tigers[i].id);
                        //console.log(tigers[i].y,tigers[i].x);
                    }

                }
                else//温饱状态且自由移动
                {
                    if(Math.random()<Tiger_randomRunP ){//会移动
                        
                        if(Math.random()<Tiger_randomRunNoDirP){
                            grids[tigers[i].y/unit][tigers[i].x/unit].deleteTiger(tigers[i].id);
                            //console.log("randomMove",tigers[i].y,tigers[i].x);
                            tigers[i].randomMove(TIGER);
                            grids[tigers[i].y/unit][tigers[i].x/unit].insertTiger(tigers[i].id);
                            //console.log(tigers[i].y,tigers[i].x);
                        }
                        else{
                            grids[tigers[i].y/unit][tigers[i].x/unit].deleteTiger(tigers[i].id);
                            //console.log("MoveToCow",tigers[i].y,tigers[i].x);
                            tigers[i].moveToCow(cow_cluster,tiger_cluster);
                            grids[tigers[i].y/unit][tigers[i].x/unit].insertTiger(tigers[i].id);
                            //console.log(tigers[i].y,tigers[i].x);
                        }

                    }
                    else{
                        //stay
                    }
                }
            }
            
            if(flag_tick){
                tigers[i].tick();
            }
            else{
                if(tigers[i].checkEnergy()){grids[tigers[i].y/unit][tigers[i].x/unit].deleteTiger(tigers[i].id);};
            }
        }
        else
        {
            deadTigerId.append(i);
            //在grid中删掉这个id
        }
    }
    if(flag_informationUpdate){
        tiger_cluster=temp_tiger_cluster;
    }
    //对于可能的情况进行繁殖
    TigerReproduce();
}


function Grass_behave(flag_informationUpdate,flag_tick){
    /**
     * 草的生命时钟tick
     * 繁殖
     */
     var temp_grass_cluster=[];
    if(flag_informationUpdate){
        for(var i=0;i<parseInt(upperBound_x/grass_cluster_x);i++){
            for (var j=0;j<parseInt(upperBound_y/grass_cluster_y);j++){
                temp_grass_cluster.push(0);
            }
        }
    }
    //console.log(parseInt(temp_grass_cluster.length));
    for(var i=0;i<grasses.length;i++)
    {
        if(flag_tick){
            grasses[i].tick();
        }
        if(!grasses[i].live)
        {
            deadGrassId.append(i);
        }
        else{
            if(flag_informationUpdate){
                temp_grass_cluster[parseInt(grasses[i].y/grass_cluster_y)+parseInt(grasses[i].x/grass_cluster_x)*(parseInt(upperBound_y/grass_cluster_y))]++;
            }
        }
    }
    if(flag_informationUpdate){
        grass_cluster=temp_grass_cluster;
    }
    GrassReproduce();
}

function update_Weather(){
    if(Math.random()<=SUN_P)
    {
        weather=SUN;
    }
    else{
        if(Math.random()<=CLOUDY_P){
            weather=CLOUDY;
        }
        else{
            weather=RAIN;
        }
    }
}



//行动计数器
var behaveCount=0;
//所有的行动
function behave()
{

    
    //天气行动
    var flag_weather=true;
    //只有一age初始更新一次天气
    if(behaveCount!=0){
        flag_weather=false;    
    }
    
    if(flag_weather){
        update_Weather();
    }
    
    if(weather==RAIN){
        
        //牛行动的回合
        if(order_Rain[behaveCount]==COW){

            var Cow_flag_informationUpdate=false;
            var Cow_flag_tick=false;

            //该更新引导信息和tick的时候
            if(behaveCount==order_Rain_Cowtick){
                Cow_flag_informationUpdate=true;
                Cow_flag_tick=true;
            }

            Cow_behave(Cow_flag_informationUpdate,Cow_flag_tick);

        }

        //老虎行动的回合
        if(order_Rain[behaveCount]==TIGER){

            var Tiger_flag_informationUpdate=false;
            var Tiger_flag_tick=false;

            //该更新引导信息和tick的时候
            if(behaveCount==order_Rain_Tigertick){
                Tiger_flag_informationUpdate=true;
                Tiger_flag_tick=true;
            }

            Tiger_behave(Tiger_flag_informationUpdate,Tiger_flag_tick);

        }

        //草行动的回合
        if(order_Rain[behaveCount]==GRASS){
            
            var Grass_flag_informationUpdate=true;
            var Grass_flag_tick=true;

            Grass_behave(Grass_flag_informationUpdate,Grass_flag_tick);

        }

        behaveCount++;
        if(behaveCount==order_Rain.length){
            behaveCount=0;
        }

    }
    else{

        //牛行动的回合
        if(order_Sun_Cloudy[behaveCount]==COW){
            
            var Cow_flag_informationUpdate=false;
            var Cow_flag_tick=false;

            //该更新引导信息和tick的时候
            if(behaveCount==order_Sun_Cloudy_Cowtick){
                //Cow_flag_informationUpdate=true;
                Cow_flag_tick=true;
            }
            Cow_flag_informationUpdate=true;

            //console.log(grasses.length);

            Cow_behave(Cow_flag_informationUpdate,Cow_flag_tick);

        }

        //老虎行动的回合
        if(order_Sun_Cloudy[behaveCount]==TIGER){

            var Tiger_flag_informationUpdate=false;
            var Tiger_flag_tick=false;

            //该更新引导信息和tick的时候
            if(behaveCount==order_Sun_Cloudy_Tigertick){
                //Tiger_flag_informationUpdate=true;
                Tiger_flag_tick=true;
            }
            Tiger_flag_informationUpdate=true;

            Tiger_behave(Tiger_flag_informationUpdate,Tiger_flag_tick);

        }

        //草行动的回合
        if(order_Sun_Cloudy[behaveCount]==GRASS){
            
            var Grass_flag_informationUpdate=true;
            var Grass_flag_tick=true;

            Grass_behave(Grass_flag_informationUpdate,Grass_flag_tick);

        }

        behaveCount++;
        if(behaveCount==order_Sun_Cloudy.length){
            behaveCount=0;
        }

    }
    
    // //牛
    // var Cow_flag_informationUpdate=true;
    // var Cow_flag_tick=true;

    // Cow_behave(Cow_flag_informationUpdate,Cow_flag_tick);

    // //老虎
    // var Tiger_flag_informationUpdate=true;
    // var Tiger_flag_tick=true;
    
    // Tiger_behave(Tiger_flag_informationUpdate,Tiger_flag_tick);

    // //草
    // var Grass_flag_informationUpdate=true;
    // var Grass_flag_tick=true;

    // Grass_behave(Grass_flag_informationUpdate,Grass_flag_tick);
    
    deadCowsId.clear();
    deadTigerId.clear();
    deadGrassId.clear();
}

var t;
function draw()
{
    context.clearRect(0,0,1000,600);
    //for(var i=0;i<map_matrix_x;i++);
    //TigerBFS(0,0);
    stop = false;
    drawGrass();
    drawCow();
    drawTiger();
    drawBarrier();
    document.getElementById("tigerNum").innerHTML=liveTigers;
    document.getElementById("grassNum").innerHTML=liveGrasses;
    document.getElementById("cowNum").innerHTML=liveCows;
    if(weather==SUN){
        document.getElementById("weather").innerHTML="Sun";
    }
    else{
        if(weather==CLOUDY){
            document.getElementById("weather").innerHTML="Cloudy";
        }
        else{
            document.getElementById("weather").innerHTML="Rain";
        }

    }
    behave();
    
    liveCows=0;
    liveGrasses=0;
    liveTigers=0;
    //console.log(liveGrasses);

    // t = setTimeout("draw()",unit);
    //console.log();
    //requestAnimationFrame(draw);
}

function play()
{
    clearTimeout(t);
    //console.log(document.getElementById("ini_t").value);
    var t_num = document.getElementById("ini_t").value;
    var c_num = document.getElementById("ini_c").value;
    //document.getElementById("tigerNum").innerHTML=3000;

    tigers.splice(0,tigers.length);
    grasses.splice(0,grasses.length);
    cows.splice(0,cows.length);

    deadCowsId.clear();
    deadTigerId.clear();
    deadGrassId.clear();
    liveCows=0;
    liveGrasses=0;
    liveTigers=0;

    //清除grids里面数据
    for(var i=0;i<map_matrix_y;i++)
    {
        for(var j=0;j<map_matrix_x;j++)
        {
            grids[i][j].clear_tempCows();
            grids[i][j].clear_tempTigers();
        }
    }
    Grass.number=-1;
    Cow.numebr=-1;
    Tiger.number = -1;

    //初始化grass_cluster
    grass_cluster.splice(0,grass_cluster.length);
    for(var i=0;i<parseInt(upperBound_x/grass_cluster_x);i++){
        for (var j=0;j<parseInt(upperBound_y/grass_cluster_y);j++){
            grass_cluster.push(0);
        }
    }
    cow_cluster.splice(0,cow_cluster.length);
    //初始化cow_cluster
    for(var i=0;i<parseInt(upperBound_x/cow_cluster_x);i++){
        for (var j=0;j<parseInt(upperBound_y/cow_cluster_y);j++){
            cow_cluster.push(0);
        }
    }
    tiger_cluster.splice(0,tiger_cluster.length);
    //初始化tiger_cluster
    for(var i=0;i<parseInt(upperBound_x/tiger_cluster_x);i++){
        for (var j=0;j<parseInt(upperBound_y/tiger_cluster_y);j++){
            tiger_cluster.push(0);
        }
    }


    initTiger(t_num);
    initCow(c_num);
    initGrass();

    //生成晴天和阴天排班:
    var k=1;//牛
    var h=1;//老虎
    var flag_k=true;
    var flag_h=true;
    for(var i=0;i<Cow_Speed_Sun_Cloudy+Tiger_Speed_Sun_Cloudy;i++){
        if(((k/(Cow_Speed_Sun_Cloudy+1))>(h/(Tiger_Speed_Sun_Cloudy+1)) && (h!=(Tiger_Speed_Sun_Cloudy+1))) || (k==(Cow_Speed_Sun_Cloudy+1))){
            order_Sun_Cloudy.push(TIGER);
            h++;
        }
        else if(((k/(Cow_Speed_Sun_Cloudy+1))<(h/(Tiger_Speed_Sun_Cloudy+1)) && (k!=(Cow_Speed_Sun_Cloudy+1))) || (h==(Tiger_Speed_Sun_Cloudy+1)))
        {
            //console.log("cow");
            order_Sun_Cloudy.push(COW);
            k++;
        }
        else {
            if(Cow_Speed_Sun_Cloudy<=Tiger_Speed_Sun_Cloudy){
                order_Sun_Cloudy.push(TIGER);
                h++;
            }
            else{
                order_Sun_Cloudy.push(COW);
                k++;
            }
        }
        if(k==(Cow_Speed_Sun_Cloudy+1) && flag_k){
            order_Sun_Cloudy_Cowtick=i;
            //console.log("i")
            flag_k=false;
        }
        if(h==(Tiger_Speed_Sun_Cloudy+1) && flag_h){
            order_Sun_Cloudy_Tigertick=i;
            //console.log("i")
            flag_h=false;
        }
    }
    order_Sun_Cloudy.push(GRASS);

    var k=1;//牛
    var h=1;//老虎
    var flag_k=true;
    var flag_h=true;
    //生成雨天排班:
    for(var i=0;i<Cow_Speed_Rain+Tiger_Speed_Rain;i++){
        
        if(((k/(Cow_Speed_Rain+1))>(h/(Tiger_Speed_Rain+1)) && (h!=(Tiger_Speed_Rain+1))) || (k==(Cow_Speed_Rain+1))){
            order_Rain.push(TIGER);
            h++;
        }
        else if(((k/(Cow_Speed_Rain+1))<(h/(Tiger_Speed_Rain+1)) && (k!=(Cow_Speed_Rain+1))) || (h==(Tiger_Speed_Rain+1)))
        {
            order_Rain.push(COW);
            k++;
        }
        else {  
            if(Cow_Speed_Rain<=Tiger_Speed_Rain){
                order_Rain.push(TIGER);
                h++;
            }
            else{
                order_Rain.push(COW);
                k++;
            }
        }
        if(k==(Cow_Speed_Rain+1) && flag_k){
            order_Rain_Cowtick=i;
            //console.log(i)
            flag_k=false;
        }
        if(h==(Tiger_Speed_Rain+1) && flag_h){
            order_Rain_Tigertick=i;
            //console.log(i)
            flag_h=false;
        }
    }
    order_Rain.push(GRASS)

    //draw();
    setInterval(() => {
        draw();
    }, 25);
}

var temp_s_x=-1;
var temp_s_y=-1;
function search(species_type,id_f){
    // console.log("search")
    // console.log(species_type)
    // console.log(id_f)
    // console.log(tigers.length)
    // console.log(cows.length)
    // console.log(grasses.length)

    

    if(species_type=="Tiger" && id_f<tigers.length && id_f>0){
        if(tigers[id_f].live){
            document.getElementById("s_live").innerHTML="Servive";
        }
        else{
            document.getElementById("s_live").innerHTML="Dead";
        }
        document.getElementById("s_x").innerHTML=tigers[id_f].x;
        temp_s_x=tigers[id_f].x;
        document.getElementById("s_y").innerHTML=tigers[id_f].y;
        temp_s_y=tigers[id_f].y;
        if(tigers[id_f].dir==LEFT){
            document.getElementById("s_dir").innerHTML="Left";
        }
        else if(tigers[id_f].dir==RIGHT){
            document.getElementById("s_dir").innerHTML="Right";
        }
        else if(tigers[id_f].dir==UP){
            document.getElementById("s_dir").innerHTML="Up";
        }
        else if(tigers[id_f].dir==DOWN){
            document.getElementById("s_dir").innerHTML="Down";
        }
        else{
            document.getElementById("s_dir").innerHTML="Stay";
        }
        document.getElementById("s_age").innerHTML=tigers[id_f].age;
        document.getElementById("s_energy").innerHTML=tigers[id_f].energy;
        document.getElementById("s_reproduce_num").innerHTML=tigers[id_f].reproduceNum;

    }
    else if(species_type=="Cow" && id_f<cows.length && id_f>0){
        if(cows[id_f].live){
            document.getElementById("s_live").innerHTML="Servive";
        }
        else{
            document.getElementById("s_live").innerHTML="Dead";
        }
        document.getElementById("s_x").innerHTML=cows[id_f].x;
        temp_s_x=cows[id_f].x;
        document.getElementById("s_y").innerHTML=cows[id_f].y;
        temp_s_x=cows[id_f].y;
        if(cows[id_f].dir==LEFT){
            document.getElementById("s_dir").innerHTML="Left";
        }
        else if(cows[id_f].dir==RIGHT){
            document.getElementById("s_dir").innerHTML="Right";
        }
        else if(cows[id_f].dir==UP){
            document.getElementById("s_dir").innerHTML="Up";
        }
        else if(cows[id_f].dir==DOWN){
            document.getElementById("s_dir").innerHTML="Down";
        }
        else{
            document.getElementById("s_dir").innerHTML="Stay"
        }
        document.getElementById("s_age").innerHTML=cows[id_f].age;
        document.getElementById("s_energy").innerHTML=cows[id_f].energy;
        document.getElementById("s_reproduce_num").innerHTML=cows[id_f].reproduceNum;
    }
    else if(species_type=="Grass" && id_f<grasses.length && id_f>0){
        if(grasses[id_f].live){
            document.getElementById("s_live").innerHTML="Servive";
        }
        else{
            document.getElementById("s_live").innerHTML="Dead";
        }
        document.getElementById("s_x").innerHTML=grasses[id_f].x;
        temp_s_x=grasses[id_f].x;
        document.getElementById("s_y").innerHTML=grasses[id_f].y;
        temp_s_y=grasses[id_f].y;
        document.getElementById("s_dir").innerHTML="Stay";
        document.getElementById("s_age").innerHTML=grasses[id_f].age;
        document.getElementById("s_energy").innerHTML=grasses[id_f].energy;
        document.getElementById("s_reproduce_num").innerHTML="No this attribute";
    }
    else{

        document.getElementById("s_live").innerHTML="illegal id";
        document.getElementById("s_x").innerHTML="illegal id";
        document.getElementById("s_y").innerHTML="illegal id";
        document.getElementById("s_dir").innerHTML="illegal id";
        document.getElementById("s_age").innerHTML="illegal id";
        document.getElementById("s_energy").innerHTML="illegal id";
        document.getElementById("s_reproduce_num").innerHTML="illegal id";
    }

    if(temp_s_x!=-1 && temp_s_y!=-1){
        context.fillStyle =color_tag;
        context.fillRect(temp_s_x,temp_s_y,unit,unit);
    }
    

}


var species_type;
var id_f;
var svalue;
function search_id(){
    species_type=document.getElementsByName("species_type");
    id_f=document.getElementById("id_f").value;
    
    
    for(var i=0;i<species_type.length;i++){
        if(species_type[i].checked){
            svalue=species_type[i].value;
        }
    }
    //console.log(svalue);
    setInterval(() => {
        search(svalue,id_f);
    }, 10);

}


/**
 * 改进的地方
 * 1.修复数据残留的问题 已解决
 * 2.将speed实际运用
 * 3.参数合理
 * 4.天气因素的问题
 * 5.动画更好
 * 6.时间的问题
 * 7.是否能将地图扩大
 * 
 */

