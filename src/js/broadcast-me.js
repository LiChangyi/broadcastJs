function Broadcast (el,imagesAndUrl,JSON) {
  if(el==null || imagesAndUrl == null) {
    console.log("请传入节点或者图片数据及链接！");
    return;
  }
  this.el = el;
  this.imagesAndUrl = imagesAndUrl;
  this.timer = JSON.transitionTime || 800;
  this.intervalTime = JSON.intervalTime || 5000;

  // 定义一些全局变量
  this.index = 1; 
  this.animationMark = false;
  this.init();
}

// init => 添加dom节点,初始化界面
Broadcast.prototype.init = function () {
  // 动态添加一些css样式
  let cssStr = `.broadcastMe .broadcastMe-list {width: ${(this.imagesAndUrl.length+2)*this.el.clientWidth}px;}.broadcastMe .broadcastMe-list .broadcastMe-item {width:${this.el.clientWidth}px;}`
  let styleNode = document.createElement('style');
  styleNode.innerText = cssStr;
  document.head.appendChild(styleNode)

  var html = `<div class="broadcastMe">
                <div class="broadcastMe-list" style="left:-${this.el.clientWidth}px">`;
  
  // 添加显示图片区域
  // 无缝轮播，收尾多加一张
  let temStr = `<div class="broadcastMe-item">
          <a href="${this.imagesAndUrl[this.imagesAndUrl.length-1].linkHref==null?"#":this.imagesAndUrl[this.imagesAndUrl.length-1].linkHref}"><img src="${this.imagesAndUrl[this.imagesAndUrl.length-1].imgSrc}" alt="轮播图图片-pawn"></a>
        </div>`
  
  this.imagesAndUrl.map( item => {
    temStr += `<div class="broadcastMe-item">
                  <a href="${item.linkHref==null?"#":item.linkHref}"><img src="${item.imgSrc}" alt="轮播图图片-pawn"></a>
              </div>`
  })
  temStr += `<div class="broadcastMe-item">
              <a href="${this.imagesAndUrl[0].linkHref==null?"#":this.imagesAndUrl[0].linkHref}"><img src="${this.imagesAndUrl[0].imgSrc}" alt="轮播图图片-pawn"></a>
            </div>`
  html += temStr + "</div>";

  temStr = `<div class="broadcastMe-tool">
              <div class="broadcastMe-spot broadcastMe-spot-active"></div>`;
  // 添加下面小圆点
  for(let i=1,len=this.imagesAndUrl.length;i<len;i++){
    temStr += `<div class="broadcastMe-spot"></div>`;
  }
  html += temStr + "</div>"

  // 添加左右2边按钮
  temStr = `<div class="broadcastMe-btn broadcastMe-btn-left"><</div>
            <div class="broadcastMe-btn broadcastMe-btn-right">></div>`

  html += temStr;

  this.el.innerHTML += html + "</div>";

  // 调用绑定事件
  this.bindEvent();
}

// bindEvent => 绑定节点事件/自动轮播开启事件
Broadcast.prototype.bindEvent = function () {
  // 获取要用到的节点信息
  this.broadcastMe = this.el.getElementsByClassName('broadcastMe')[0];
  this.broadcastMeList = this.el.getElementsByClassName('broadcastMe-list')[0];
  this.broadcastMeTool = this.el.getElementsByClassName('broadcastMe-tool')[0];
  this.broadcastMeSpot = this.el.getElementsByClassName('broadcastMe-spot');
  this.broadcastMeBtnLeft = this.el.getElementsByClassName('broadcastMe-btn-left')[0];
  this.broadcastMeBtnRight = this.el.getElementsByClassName('broadcastMe-btn-right')[0];

  
  // 左右按钮 事件监听 
  this.broadcastMeBtnLeft.addEventListener('click', () => {
    if(this.animationMark) return;
    this.index--;
    this.render();
  });
  this.broadcastMeBtnRight.addEventListener('click', () => {
    if(this.animationMark) return;
    this.index++;
    this.render();
  });

  // 下面小圆点点击事件监听
  this.broadcastMeTool.addEventListener('click',e => {
    let obj = e.target;
    if(obj.className != "broadcastMe-spot") return;
    this.spotClick(obj);
  })

  // 开启自动轮播
  var timer = setInterval(autoPlay.bind(this),this.intervalTime);

  this.el.addEventListener("mouseover",() => {
    clearInterval(timer);
  })

  this.el.addEventListener("mouseout",() => {
    timer = setInterval(autoPlay.bind(this),this.intervalTime);
  })

  // 移动端手指滑动
  let stratPointX = 0;
  let offsetX = 0;
  this.el.addEventListener("touchstart", (e) => {
    // 清楚定时器，因为移动端不能监听到Mouseover时间
    clearInterval(timer);

    stratPointX = e.changedTouches[0].pageX;
    offsetX = this.broadcastMeList.offsetLeft;
    this.animationMark = true;
  })
  this.el.addEventListener("touchmove", (e) => {
    let disX = e.changedTouches[0].pageX - stratPointX;
    let left = offsetX + disX;

    this.broadcastMeList.style.transitionProperty = 'none';
    this.broadcastMeList.style.left = left + 'px';
  })
  this.el.addEventListener("touchend", () => {
    let left = this.broadcastMeList.offsetLeft;
    // 判断正在滚动的图片距离左右图片的远近，
    this.index = Math.round(-left/this.el.clientWidth);
    this.animationMark = false;
    // 开启定时器
    timer = setInterval(autoPlay.bind(this),this.intervalTime);

    this.render();
  })

  
  // 封装自动轮播
  function autoPlay () {
    if(this.animationMark) return;
    this.index++;
    this.render();
  }
}

// render => 根据index的值，渲染当前要显示的界面
Broadcast.prototype.render = function () {
  if(this.animationMark) return;

  this.animationMark = true;
  // 修改broadcastMeList 的left值
  this.broadcastMeList.style.left = (-1)*this.el.clientWidth*this.index + 'px';
  this.broadcastMeList.style.transition = 'left ' + this.timer/1000 + 's';

  setTimeout(() => {
    // 添加判断，防止出界
    if(this.index <= 0){
      this.broadcastMeList.style.transitionProperty = 'none';
      this.index = this.imagesAndUrl.length;
      this.broadcastMeList.style.left = (-1)*this.el.clientWidth*this.index + 'px';
    }else if (this.index > this.imagesAndUrl.length){ 
      this.broadcastMeList.style.transitionProperty = 'none';
      this.index = 1;
      this.broadcastMeList.style.left = (-1)*this.el.clientWidth*this.index + 'px';
    }
    this.animationMark = false;
  },this.timer)

  this.renderSpot();
}

// renderSpot => 渲染最下面的小圆点
Broadcast.prototype.renderSpot = function () {
  let flag = this.index;
  if(this.index <= 0){
    flag = this.imagesAndUrl.length;
  }else if(this.index > this.imagesAndUrl.length){
    flag = 1;
  }

  for(let i=0,len=this.broadcastMeSpot.length;i<len;i++){
    if(i==(flag-1)){
      this.broadcastMeSpot[i].className = "broadcastMe-spot broadcastMe-spot-active";
    }else{
      this.broadcastMeSpot[i].className = "broadcastMe-spot";
    }
  }
}

// spotClick => 下面小圆点点击事件
Broadcast.prototype.spotClick = function (obj) {
  for(let i=0,len=this.broadcastMeSpot.length;i<len;i++){
    if(this.broadcastMeSpot[i] === obj){
      this.index = i+1;
      this.render();
      break;
    }
  }
}

// 如果是在vue的环境下使用，取消下面的注释
// module.exports = Broadcast;