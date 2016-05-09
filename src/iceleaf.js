import PIXI from './Library/pixi.js/src/index';
var fps = require('./Utils/fps.js');

import Sprite from './Classes/Sprite';
import TextSprite from './Classes/TextSprite';
import TextWindow from './Classes/TextWindow';
import Action from './Classes/Action';
import * as SpriteManager from './Classes/SpriteManager';
import TWMInit from './Classes/TextWindowManager';
let TextWindowManager;
import * as SoundManager from './Classes/SoundManager';
import * as ActionManager from './Classes/ActionManager';
import Animation from './Classes/Animation';
import Err from './Classes/ErrorHandler';

class Iceleaf {
    constructor(view){
        let viewNode = SpriteManager.init();
        view.appendChild(viewNode);

        //临时hack
        this.stage = SpriteManager.getStage();
        this.renderer = SpriteManager.getRenderer();

        TextWindowManager = TWMInit(SpriteManager);
    }

    update(time){
        window.requestAnimationFrame(this.update.bind(this));
        this.renderer.render(this.stage);
        ActionManager.update(time);
    }

    start(){
        fps.installFPSView(this.stage);
        this.update();
    }


    //精灵类
    //此处rect与bke不同，默认值为null，bke默认值为[0,0,0,0]
    sprite(index,file,rect=null){
        SpriteManager.create(index, file, rect);
    }
    addto(index,target,zorder=0,pos=[0,0],opacity=255){
        SpriteManager.addto(index, target, zorder, pos, opacity/255);
    }
    layer(index,width,height,color=0xffffff,opacity=0){

    }
    remove(index,_delete=false){
        SpriteManager.remove(index, _delete);
    }
    removeall(index,_delete=false,recursive=false){
        let sp = (index===-1)?this.stage:SpriteManager.fromIndex(index);
        if(!sp)
            return Err.warn("精灵(index="+index+")不存在，此命令忽略执行");
        removeRecursive(sp);
        sp.removeChildren();
    }
    info(file,get){

    }
    infoex(file,get){

    }
    anchor_set(index,set,keep=false){
        let sp = SpriteManager.fromIndex(index);
        if(!sp)
            return Err.warn("精灵(index="+index+")不存在，此命令忽略执行");
        if(typeof set==='string')
            switch(set){
                case 'center': set=[0.5,0.5];break;
                case 'topleft': set=[0,0];break;
                case 'topright': set=[1,0];break;
                case 'topcenter': set=[0.5,0];break;
                case 'leftcenter': set=[0,0.5];break;
                case 'rightcenter': set=[1,0.5];break;
                case 'bottomcenter': set=[0.5,1];break;
                case 'bottomleft': set=[0,1];break;
                case 'bottomright': set=[1,1];break;
            }
        else
            set = [set[0]/sp.width,set[1]/sp.height]
        sp.anchor = new PIXI.Point(set[0],set[1]);
        /*keep未实现*/
    }
    zorder_set(index,set){

    }
    spriteopt(index,disable,recursive=true){

    }

    //音频类
    bgm(file,loop=true,vol=100,fadein=0,loopto=0){
        let query = SoundManager.file(-1,file).loop(-1,loop).volume(-1,0).autoPlay(-1,false)
        if(loopto&&loop){
            let firstLoop = true;
            query.onEnd(-1,() => {
                if(firstLoop)
                    firstLoop = false;
                else
                    SoundManager.setPosition(-1,loopto/1000);
            });
        }
        query.exec(-1);
        SoundManager.play(-1);
        SoundManager.fadeTo(-1,vol/100,fadein);

    }
    se(file,channel=0,loop=false,vol=100,fadein=0){
        SoundManager.file(channel,file).loop(channel,loop).volume(channel,0).autoPlay(channel,false).exec(channel);
        SoundManager.play(channel);
        SoundManager.fadeTo(channel,vol/100,fadein);
    }
    voice(file,vol=100){
        SoundManager.file(-2,file).loop(-2,false).volume(-2,vol/100).autoPlay(-2,true).exec(-2);
    }
    stop(channel,fadeout=0){
        if(typeof channel==='undefined')
            SoundManager.stopAll();
        else
            SoundManager.fadeTo(channel,0,fadeout,()=>{
                SoundManager.stop(channel);
            })
    }
    volume_set(channel,set){
        SoundManager.setVolume(channel,set/100);
    }
    pause(channel){
        if(SoundManager.status(channel)==='play')
            SoundManager.pause(channel);
    }
    resume(channel){
        if(SoundManager.status(channel)==='pause')
            SoundManager.pause(channel);
    }
    fade(channel,time,to,stop=false){
        if(stop)
            SoundManager.fadeTo(channel,to/100,time,()=>SoundManager.stop(channel));
        else
            SoundManager.fadeTo(channel,to/100,time);
    }

    //动画类
    animate_horizontal({index,file,frame,row=1,interval=33,loop='forward'}){
        let ani = new Animation();
        ani.setType('horizontal').setIndex(index).setFile(file)
           .setFrame(frame).setRow(row).setInterval(interval)
           .setLoopType(loop)
           .exec();
        SpriteManager.insert(index,ani);
    }
    animate_vertical({index,file,frame,column=1,interval=33,loop='forward'}){
        let ani = new Animation();
        ani.setType('vertical').setIndex(index).setFile(file)
           .setFrame(frame).setColumn(column).setInterval(interval)
           .setLoopType(loop)
           .exec();
        SpriteManager.insert(index,ani);
    }
    animate_multifiles({index,files,interval=33,loop=true,delay=0}){
        let ani = new Animation();
        ani.setType('multifiles').setIndex(index).setFile(files)
           .setInterval(interval).setLoop(loop).setDelay(delay)
           .exec();
        SpriteManager.insert(index,ani);
    }
    animate_start(index){
        let sp = SpriteManager.fromIndex(index);
        if(!sp)
            return Err.warn("精灵(index="+index+")不存在，此命令忽略执行");
        sp.start();
    }
    animate_cell(index,frame){
        let sp = SpriteManager.fromIndex(index);
        if(!sp)
            return Err.warn("精灵(index="+index+")不存在，此命令忽略执行");
        sp.cell(frame);
    }
    animate_stop(index){
        let sp = SpriteManager.fromIndex(index);
        if(!sp)
            return Err.warn("精灵(index="+index+")不存在，此命令忽略执行");
        sp.stop();
    }

    //文本类
    textsprite(index,text,color=0xffffff,size=24,font="sans-serif",width=-1,height=-1,xinterval=0,yinterval=3,extrachar="...",bold=false,italic=false,strike=false,under=false,shadow=false,shadowcolor=0x0,stroke=false,strokecolor=0x0){
        var tsp = new TextSprite();
        tsp.setIndex(index).setText(text).setColor(color).setSize(size).setFont(font)
           .setTextWidth(width).setTextHeight(height).setXInterval(xinterval).setYInterval(yinterval)
           .setExtraChar(extrachar).setBold(bold).setItalic(italic)/*.setStrike(strike).setUnder(under)*/
           .setShadow(shadow).setShadowColor(shadowcolor).setStroke(stroke).setStrokeColor(strokecolor)
           .exec();
        SpriteManager.insert(index,tsp);
    }

    textwindow(fileOrColor,opacity,pos,rect,xInterval,yInterval) {
        if(typeof pos !== 'undefined') TextWindowManager.setPosition(pos);
        if(typeof rect !== 'undefined') TextWindowManager.setTextRectangle(rect);
        if(typeof xInterval !== 'undefined') TextWindowManager.setXInterval(xInterval);
        if(typeof yInterval !== 'undefined') TextWindowManager.setYInterval(yInterval);

        if(typeof fileOrColor === 'number')
            TextWindowManager.setBackgroundColor(fileOrColor);
        else if(fileOrColor)
            TextWindowManager.setBackgroundFile(fileOrColor);

        if(typeof opacity !== 'undefined') TextWindowManager.setOpacity(opacity);
    }

    messagelayer(index,active=true){
        let currentWindow = SpriteManager.fromIndex(this.textWindowIndex);
        let targetWindow = SpriteManager.fromIndex(index);
        if(!targetWindow || targetWindow.name!='TextWindow')    //未找到文字框或不是文字框
        {
            if(targetWindow) targetWindow.destroy();
            let tw = currentWindow.clone();
            tw.setIndex(index);
            tw.clearText();
            SpriteManager.insert(index,tw);
            this.textWindowIndex = index;

            this.stage.addChild(tw);
            SpriteManager.setZorder(index,tw.zorder);
        }

        if(active){
            this.textWindowIndex = index;
        }
    }

    texton(){

        TextWindowManager.setVisible(true);
    }

    textoff(){

        TextWindowManager.setVisible(false);
    }

    text(text){

        TextWindowManager.drawText(text);
    }

    textstyle({name,size,color,bold,italic,strike,underline,shadow,shadowColor,stroke,strokeColor}){

        if(typeof name !== 'undefined') TextWindowManager.setTextFont(name);
        if(typeof size !== 'undefined') TextWindowManager.setTextSize(size);
        if(typeof color !== 'undefined') TextWindowManager.setTextColor(color);
        if(typeof bold !== 'undefined') TextWindowManager.setTextBold(bold);
        if(typeof italic !== 'undefined') TextWindowManager.setTextItalic(italic);
        if(typeof strike !== 'undefined') TextWindowManager.setTextStrike(strike);
        if(typeof underline !== 'undefined') TextWindowManager.setTextUnderline(underline);
        if(typeof shadow !== 'undefined') TextWindowManager.setTextShadow(shadow,shadowColor);
        if(typeof stroke !== 'undefined') TextWindowManager.setTextStroke(stroke,strokeColor);
    }

    textspeed(value){
        // 0-100 线性转换到 1字/s - 立刻显示 非线性映射…………真是够了
        TextWindowManager.setTextSpeed(value===100?Infinity:(10/(1-value/100)));
    }

    textcursor({index,follow,pos}){
        let sp = SpriteManager.fromIndex(index);
        if(!sp)
            return Err.warn("精灵(index="+index+")不存在，此命令忽略执行");

        TextWindowManager.setTextCursor(sp,follow,pos);
    }

    locate({x,y}){
        let tw = SpriteManager.fromIndex(this.textWindowIndex);
        if(!tw || !(tw instanceof TextWindow))
            return Err.warn("文字框(index="+this.textWindowIndex+")不存在或该Index对应的不是一个文字框，此命令忽略执行");

        tw.relocate({
            x: x,
            y: y
        });
    }

    i(){
        let tw = SpriteManager.fromIndex(this.textWindowIndex);
        if(!tw || !(tw instanceof TextWindow))
            return Err.warn("文字框(index="+this.textWindowIndex+")不存在或该Index对应的不是一个文字框，此命令忽略执行");

        tw.styleSwitch({i:true});
    }

    b(){
        let tw = SpriteManager.fromIndex(this.textWindowIndex);
        if(!tw || !(tw instanceof TextWindow))
            return Err.warn("文字框(index="+this.textWindowIndex+")不存在或该Index对应的不是一个文字框，此命令忽略执行");

        tw.styleSwitch({b:true});
    }

    s(){
        let tw = SpriteManager.fromIndex(this.textWindowIndex);
        if(!tw || !(tw instanceof TextWindow))
            return Err.warn("文字框(index="+this.textWindowIndex+")不存在或该Index对应的不是一个文字框，此命令忽略执行");

        tw.styleSwitch({s:true});
    }

    u(){
        let tw = SpriteManager.fromIndex(this.textWindowIndex);
        if(!tw || !(tw instanceof TextWindow))
            return Err.warn("文字框(index="+this.textWindowIndex+")不存在或该Index对应的不是一个文字框，此命令忽略执行");

        tw.styleSwitch({u:true});
    }

    r(){
        let tw = SpriteManager.fromIndex(this.textWindowIndex);
        if(!tw || !(tw instanceof TextWindow))
            return Err.warn("文字框(index="+this.textWindowIndex+")不存在或该Index对应的不是一个文字框，此命令忽略执行");

        tw.newline();
    }

    er(){
        let tw = SpriteManager.fromIndex(this.textWindowIndex);
        if(!tw || !(tw instanceof TextWindow))
            return Err.warn("文字框(index="+this.textWindowIndex+")不存在或该Index对应的不是一个文字框，此命令忽略执行");

        tw.clearText();
    }


    // 动作类
    // action_queue(){
    //     ActionManager.queue();
    // }

    // action_parallel(){
    //     ActionManager.parallel();
    // }

    // action_end({target,times}){
    //     let sp;
    //     if(typeof target !== 'undefined')
    //         sp = SpriteManager.fromIndex(target);
    //     ActionManager.end(sp,times);
    // }

    // action_moveby({pos,time=0,target,ease}){
    //     let sp;
    //     if(typeof target !== 'undefined')
    //         sp = SpriteManager.fromIndex(target);
    //     let action = new Action({
    //         mode: "moveby",
    //         pos: pos,
    //         target: sp,
    //         ease: ease
    //     })
    //     ActionManager.add(action);
    // }

}


function removeRecursive(sprite){
    for (var i = sprite.children.length - 1; i >= 0; i--) {
        removeRecursive(sprite.children[i])
    };
    SpriteManager.remove(sprite.index);
}


const Y = f =>
    (x => f(y => x(x)(y)))
    (x => f(y => x(x)(y)))


module.exports = Iceleaf;
