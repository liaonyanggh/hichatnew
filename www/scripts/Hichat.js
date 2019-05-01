window.onload = function() {
    //实例并初始化我们的hichat程序
    var hichat = new HiChat();
    hichat.init();
};

//定义我们的hichat类
var HiChat = function() {
    this.socket = null;
};

//向原型添加业务方法
HiChat.prototype = {
    init: function() {//此方法初始化程序
        var that = this;
        //建立到服务器的socket连接
        this.socket = io.connect();
        //监听socket的connect事件，此事件表示连接已经建立
        this.socket.on('connect', function() {
            //连接到服务器后，显示昵称输入框
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });
		//昵称设置的确定按钮
		document.getElementById('loginBtn').addEventListener('click', function() {
		var nickName = document.getElementById('nicknameInput').value;
		//检查昵称输入框是否为空
		if (nickName.trim().length != 0) {
		//不为空，则发起一个login事件并将输入的昵称发送到服务器
		that.socket.emit('login', nickName);
		} else {
		//否则输入框获得焦点
		document.getElementById('nicknameInput').focus();
		};
		}, false);

		this.socket.on('nickExisted', function() {
        	document.getElementById('info').textContent = '!nickname is taken, choose another pls'; //显示昵称被占用的提示
        });

		document.getElementById('sendBtn').addEventListener('click', function() {
			var messageInput = document.getElementById('messageInput'),
				msg = messageInput.value;
			messageInput.value = '';
			messageInput.focus();
			if (msg.trim().length != 0) {
				that.socket.emit('postMsg', msg); //把消息发送到服务器
				that._displayNewMsg('me', msg); //把自己的消息显示到自己的窗口中
			};
		}, false);
		
		document.getElementById('sendImage').addEventListener('change', function() {
			//检查是否有文件被选中
			 if (this.files.length != 0) {
				//获取文件并用FileReader进行读取
				 var file = this.files[0],
					 reader = new FileReader();
				 if (!reader) {
					 that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
					 this.value = '';
					 return;
				 };
				 reader.onload = function(e) {
					//读取成功，显示到页面并发送到服务器
					 this.value = '';
					 that.socket.emit('img', e.target.result);
					 that._displayImage('me', e.target.result);
				 };
				 reader.readAsDataURL(file);
			 };
		 }, false);
		 
		 document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
			  if (e.keyCode == 13) {
				  var nickName = document.getElementById('nicknameInput').value;
				  if (nickName.trim().length != 0) {
					  that.socket.emit('login', nickName);
				  };
			  };
		  }, false);
		  document.getElementById('messageInput').addEventListener('keyup', function(e) {
			  var messageInput = document.getElementById('messageInput'),
				  msg = messageInput.value,
				  color = document.getElementById('colorStyle').value;
			  if (e.keyCode == 13 && msg.trim().length != 0) {
				  messageInput.value = '';
				  that.socket.emit('postMsg', msg, color);
				  that._displayNewMsg('me', msg, color);
			  };
		  }, false);
		
		this.socket.on('loginSuccess', function() {
		     document.title = 'hichat | ' + document.getElementById('nicknameInput').value;
		     document.getElementById('loginWrapper').style.display = 'none';//隐藏遮罩层显聊天界面
		     document.getElementById('messageInput').focus();//让消息输入框获得焦点
		 });
		 
		this.socket.on('loginSuccess', function() {
			 document.title = 'hichat | ' + document.getElementById('nicknameInput').value;
			 document.getElementById('loginWrapper').style.display = 'none';//隐藏遮罩层显聊天界面
			 document.getElementById('messageInput').focus();//让消息输入框获得焦点
		 }); 
		this.socket.on('nickExisted', function() {
			 document.getElementById('info').textContent = '!nickname is taken, choose another pls *-* '; //显示昵称被占用的提示
		 });
		 
		this.socket.on('system', function(nickName, userCount, type) {
			var msg = nickName + (type == 'login' ? ' joined' : ' left');
			//指定系统消息显示为红色
			that._displayNewMsg('system ', msg, 'red');
			document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
		});
		
		this.socket.on('newMsg', function(user, msg) {
			that._displayNewMsg(user, msg);
		});
		
		this.socket.on('newImg', function(user, img) {
			that._displayImage(user, img);
		});

    },
	_displayNewMsg: function(user, msg, color) {
	var container = document.getElementById('historyMsg'),
		msgToDisplay = document.createElement('p'),
		date = new Date().toTimeString().substr(0, 8);
	msgToDisplay.style.color = color || '#000';
	msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
	container.appendChild(msgToDisplay);
	container.scrollTop = container.scrollHeight;
    },
	_displayImage: function(user, imgData, color) {
    var container = document.getElementById('historyMsg'),
        msgToDisplay = document.createElement('p'),
        date = new Date().toTimeString().substr(0, 8);
    msgToDisplay.style.color = color || '#000';
    msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
    container.appendChild(msgToDisplay);
    container.scrollTop = container.scrollHeight;
	}
};