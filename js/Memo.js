import MemoService from './MemoService.js';

export default class Memo {
	
	/*****************************
	 *        Initialize
	 *****************************/
	
	constructor(identifier, content, position, size, order) {
		//Memo Model
		this.identifier = identifier;
		this.content = content;
		this.position = position;
		this.size = size;
		this.order = order;
		
		//MemoService 인스턴스 생성
		this.memoService = new MemoService();
		
		//drag event를 위한 variables
		this.dragger = null;
		this.drag_area = null;
		this.startDragX = 0;
		this.startDragY = 0;
		this.holder = null;
		
		//resizer를 위한 variables
		this.resizer = null;
		this.resize_area = null;
		this.startResizeX = 0;
		this.startResizeY = 0;
		this.startResizeWidth = 0;
		this.startResizeHeight = 0;
		this.resizeToggle = false;
		
		this.createDOM();
	}
	
	/**
	 * createDOM function
	 *
	 * 메모 DOM 생성 및 이벤트 바인딩 function 호출
	 */
	createDOM() {
		$(".wrap").append(`
			<div id="${this.identifier}"
			 		 class="memo"
			 		 style="top:${this.position.top}px; left:${this.position.left}px; z-index:${this.order}">
	      <div class="header">
	        <h1 class="blind">메모장</h1>
	        <button class="btn_close"><span class="blind">닫기</span></button>
	      </div>
	      <div class="content">
	        <div class="textarea"
	        		contenteditable="true"
	        		style="width:${this.size.width}px; height:${this.size.height}px;">${this.content}</div>
	      </div>
	      <button class="btn_size"><span class="blind">메모장 크기 조절</span></button>
	    </div>
		`);
		
		this.bindDragEvent();
		this.bindResizeEvent();
		this.bindInputEvent();
		this.bindRemoveEvent();
	}
	
	/*****************************
	 *       Event Handler
	 *****************************/
	
	/**
	 * bindDragEvent function
	 *
	 * 메모 드래그 이벤트 바인딩 함수
	 * (드래그 앤 드랍이 완료 된 후 쪽지는 겹처진 쪽지들 중 최상단에 위치해야 함)
	 * 처음에는 jquery를 이용하여 구현 (jquery ui의 drag n drop은 사용하지 않음)
	 * 그러나 이벤트 처리가 부자연스러워 HTML5 DragnDrop API를 사용하여 리팩토링 함
	 */
	bindDragEvent() {
		this.dragger = document.querySelector(`#${this.identifier} .header`);
		this.dragger.addEventListener('mousedown', this.initDrag.bind(this), false);
		
		this.holder = document.querySelector('.wrap');
		this.holder.addEventListener("dragover", this.dragover.bind(this), false);
		this.holder.addEventListener("dragenter", this.dragenter.bind(this), false);
		this.holder.addEventListener("drop", this.drop.bind(this), false);
	}
	
	initDrag = (e) => {
		if (e.target.className !== 'header') return;
		this.drag_area = document.querySelector(`#${this.identifier}`);
		this.drag_area.setAttribute("draggable", true);
		
		this.drag_area.addEventListener('dragstart', this.dragStart.bind(this), false);
		this.drag_area.addEventListener('dragend', this.dragEnd.bind(this), false);
	};
	
	dragStart = (e) => {
		this.drag_area.classList.add('movable');
		this.startDragX = e.pageX - this.drag_area.offsetLeft;
		this.startDragY = e.pageY - this.drag_area.offsetTop;
		return true;
	};
	
	//dragNdrop 구현을 위해 drop영역 이벤트리스너의 세 개 (dragenter, dragover, drop) function은 꼭 구현해 주어야 함.
	dragenter = (e) => {
		e.preventDefault();
		return true;
	};
	
	dragover = (e) => {
		e.preventDefault();
	};

	drop = (e) => {
		e.stopPropagation();
		return false;
	};
	
	dragEnd = (e) => {
		//브라우저 안쪽 영역에서만 dragndrop이 가능하도록 처리 (화면의 끝에 메모의 영역이 걸쳐있을때 좌표값을 계산하여 표시)
		let calcX = this.getInnerPositionX((e.pageX - this.startDragX));
		let calcY = this.getInnerPositionY((e.pageY - this.startDragY));
		
		this.memoService.findOneMemo(this.identifier)
			.then((memo) => {
				memo.position = {
					left: calcX,
					top: calcY
				};
				return this.memoService.updateMemo(memo);
			})
			.then(() => {
				this.drag_area.style.left = calcX + 'px';
				this.drag_area.style.top = calcY + 'px';
				this.drag_area.setAttribute("draggable", false);
				this.drag_area.classList.remove('movable');
				this.setHighestOrder();
			})
			.finally(() => {
				this.drag_area.setAttribute("draggable", false);
				this.drag_area.classList.remove('movable');
				this.holder.removeEventListener("dragover", this.dragover.bind(this), false);
				this.holder.removeEventListener("dragenter", this.dragenter.bind(this), false);
				this.holder.removeEventListener("drop", this.drop.bind(this), false);
				
				this.drag_area.removeEventListener('dragstart', this.dragStart.bind(this), false);
				this.drag_area.removeEventListener('dragend', this.dragEnd.bind(this), false);
			})
			.catch((error) => {
				console.log("error::\n", error);
			});
	};
	
	/**
	 * bindResizeEvent function
	 *
	 * resize button을 드래그 시 content의 크기를 resize
	 * (css의 resize property로 구현하려 했으나 추 후 ie 환경을 고려하여 js event로 구현)
	 */
	bindResizeEvent() {
		this.resizer = document.querySelector(`#${this.identifier} .btn_size`);
		this.resizer.addEventListener('mousedown', this.initResize.bind(this), false);
	}
	
	initResize(e) {
		this.resize_area = document.querySelector(`#${this.identifier} .content .textarea`);
		
		this.startResizeX = e.clientX;
		this.startResizeY = e.clientY;
		this.startResizeWidth = parseInt(document.defaultView.getComputedStyle(this.resize_area).width, 10);
		this.startResizeHeight = parseInt(document.defaultView.getComputedStyle(this.resize_area).height, 10);
		
		document.documentElement.addEventListener('mousemove', this.doResize.bind(this), false);
		document.documentElement.addEventListener('mouseup', this.stopResize.bind(this), false);
		this.resizeToggle = true;
	}
	
	doResize(e) {
		if (this.resizeToggle) {
			this.resize_area.style.width = (this.startResizeWidth + e.clientX - this.startResizeX) + 'px';
			this.resize_area.style.height = (this.startResizeHeight + e.clientY - this.startResizeY) + 'px';
			
			this.memoService.findOneMemo(this.identifier)
				.then((memo) => {
					memo.size = {
						width: (this.startResizeWidth + e.clientX - this.startResizeX),
						height: (this.startResizeHeight + e.clientY - this.startResizeY)
					};
					return this.memoService.updateMemo(memo);
				})
				.then(() => {})
				.catch((error) => {
					console.log("error::\n", error);
				});
		}
	}
	
	stopResize() {
		this.resizeToggle = false;
		document.documentElement.removeEventListener('mousemove', this.doResize.bind(this), false);
		document.documentElement.removeEventListener('mouseup', this.stopResize.bind(this), false);
	}
	
	/**
	 * bindInputEvent function
	 *
	 * .textarea의 내용을 바인딩
	 * 텍스트가 입력될 때마다 content에 저장 됨
	 */
	bindInputEvent() {
		$(`#${this.identifier} .content .textarea`).on({
			'keyup': (e) => {
				this.memoService.findOneMemo(this.identifier)
					.then((memo) => {
						memo.content = e.target.innerHTML;
						return this.memoService.updateMemo(memo);
					})
					.then(() => {})
					.catch((error) => {
						console.log("error::\n", error);
					});
			},
			'click': () => {
				this.setHighestOrder();
			}
		});
	}
	
	/**
	 * bindRemoveEvent function
	 *
	 * 메모 닫기(삭제) 이벤트 바인딩
	 * 메모의 x표시 누를시 닫기와 더불어 삭제 이벤트 로직 구현
	 */
	bindRemoveEvent() {
		$(`#${this.identifier} .header .btn_close`).click((e) => {
			this.memoService.removeMemo(this.identifier)
				.then((result) => {
					$(`#${this.identifier}`).remove();
				})
				.catch((error) => {
					console.log("error::\n", error);
				});
		});
	}
	
	/*****************************
	 *        util functions
	 *****************************/
	
	/**
	 * setHighestOrder function
	 *
	 * 현재 active DOM의 z-index를 최상위로 끌어올리는 함수
	 * mousedown 이벤트가 시작되면 DOM을 최상위로 올리고 나머지의 order를 -1씩 연산하려고 했음.
	 * 그러나 연산에 의한 z-index: -1이 될수도 있으며, 메모를 무한정 만드는 사용자는 없기때문에
	 * 로직을 변경함. (z-index: highestOrder + 1로 변경)
	 */
	setHighestOrder() {
		let promises = [
			this.memoService.findOneMemo(this.identifier),
			this.memoService.findHighestOrder()
		];
		
		Promise.all(promises)
			.then((results) => {
				results[0].order = results[1] + 1;
				return [this.memoService.updateMemo(results[0]), results[1]];
			})
			.then((results) => {
				this.order = results[1] + 1;
				return this.memoService.findMemos();
			})
			.then((memos) => {
				memos.forEach((memo) => {
					$(`#${memo.identifier}`).css({"z-index": memo.order});
				});
			})
			.catch((error) => {
				console.log("error::\n", error);
			});
	}
	
	getInnerPositionX = (x) => {
		let screenSize = this.getScreenSize();
		
		if(x < 0) return 0;
		else if (x > screenSize.width) return screenSize.width;
		else {
			if((x + this.drag_area.offsetWidth) > screenSize.width) return (screenSize.width - this.drag_area.offsetWidth);
			else return x;
		}
	};
	
	getInnerPositionY = (y) => {
		let screenSize = this.getScreenSize();
		
		if(y < 0) return 0;
		else if (y > screenSize.height) return screenSize.height;
		else {
			if((y + this.drag_area.offsetHeight) > screenSize.height) return (screenSize.height - this.drag_area.offsetHeight);
			else return y;
		}
	};
	
	getScreenSize = () => {
		let screenSize;
		let w = window,
			d = document,
			e = d.documentElement,
			g = d.getElementsByTagName('body')[0],
			x = w.innerWidth || e.clientWidth || g.clientWidth,
			y = w.innerHeight|| e.clientHeight|| g.clientHeight;
		
		screenSize = {width: x, height: y};
		
		return screenSize;
	}
}