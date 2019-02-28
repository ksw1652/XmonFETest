export default class MemoService {
	
	/*****************************
	 *        Initialize
	 *****************************/
	
	constructor() {
		this.storageMemos = null;
	}
	
	/**
	 * init function
	 *
	 * MemoService에서 관리하는 storageMemos 데이터 초기화
	 */
	init() {
		this.storageMemos = localStorage.memos;
		
		if(!this.storageMemos) {
			localStorage.setItem('memos', JSON.stringify([]));
		} else {
			this.storageMemos = this.parsingMemos();
		}
	}
	
	/*****************************
	 *     REST API Functions
	 *****************************/
	
	/**
	 * findMemos function
	 *
	 * 메모 리스트를 가져오는 function
	 * 모던 FE ajax 통신 모듈들은 Promise/Observerable을 리턴하는 것을 감안하여 Promise를 사용
	 */
	findMemos = () => new Promise((resolve, reject) => {
		this.storageMemos = this.parsingMemos();
		resolve(this.storageMemos);
	});
	
	/**
	 * findOneMemo function
	 *
	 * 한 개의 메모를 가져오는 function
	 * 모던 FE ajax 통신 모듈들은 Promise/Observerable을 리턴하는 것을 감안하여 Promise를 사용
	 */
	findOneMemo = (identifier) => new Promise((resolve, reject) => {
		this.storageMemos = this.parsingMemos();
		resolve(this.storageMemos.find((memo) => memo.identifier === identifier));
	});
	
	/**
	 * createMemo function
	 *
	 * 메모를 만드는 function
	 * 모던 FE ajax 통신 모듈들은 Promise/Observerable을 리턴하는 것을 감안하여 Promise를 사용
	 */
	createMemo = (memo) => new Promise((resolve, reject) => {
		this.storageMemos = this.parsingMemos();
		this.storageMemos.push(memo);
		localStorage.setItem("memos", JSON.stringify(this.storageMemos));
		
		resolve();
	});
	
	/**
	 * updateMemo function
	 *
	 * 메모를 업데이트하는 function
	 * 모던 FE ajax 통신 모듈들은 Promise/Observerable을 리턴하는 것을 감안하여 Promise를 사용
	 */
	updateMemo = (memo) => new Promise((resolve, reject) => {
		this.storageMemos = this.parsingMemos();
		const index = this.findIndexMemo(memo.identifier);
		const updatedMemos = [
			...this.storageMemos.slice(0, index),
			memo,
			...this.storageMemos.slice(index+1)
		];
		localStorage.setItem("memos", JSON.stringify(updatedMemos));
		
		resolve();
	});
	
	/**
	 * removeMemo function
	 *
	 * 메모를 삭제하는 function
	 * 모던 FE ajax 통신 모듈들은 Promise/Observerable을 리턴하는 것을 감안하여 Promise를 사용
	 */
	removeMemo = (identifier) => new Promise((resolve, reject) => {
		this.storageMemos = this.parsingMemos();
		const removedMemos = this.storageMemos.filter((memo) => memo.identifier !== identifier);
		localStorage.setItem("memos", JSON.stringify(removedMemos));
		resolve();
	});
	
	/*****************************
	 *       Util Functions
	 *****************************/
	
	/**
	 * findHighestOrder function
	 *
	 * 메모리스트의 데이터 중 가장 높은 순서를 가져오는 function
	 * 메모가 새로 생성될 때나, 이벤트에 의해 메모가 가장 앞으로 올때 사용 됨.
	 * 모던 FE ajax 통신 모듈들은 Promise/Observerable을 리턴하는 것을 감안하여 Promise를 사용
	 */
	findHighestOrder = () => new Promise((resolve, reject) => {
		this.storageMemos = this.parsingMemos();
		let highestOrder = 0;
		//apply 메서드를 사용하면 숫자로 이루어진 배열을 파라미터로 전달 할 수 있음
		if(this.storageMemos.length !== 0)
			highestOrder = Math.max.apply(Math, this.storageMemos.map((memo) => memo.order));
		
		resolve(highestOrder);
	});
	
	/**
	 * findIndexMemo function
	 *
	 * 메모의 인덱스를 가져오는 function
	 */
	findIndexMemo = (identifier) => {
		this.storageMemos = this.parsingMemos();
		return this.storageMemos.findIndex((memo) => memo.identifier === identifier);
	};
	
	/**
	 * parsingMemos function
	 *
	 * 메모리스트를 localStorage에서 가져오는 function
	 */
	parsingMemos() {
		return localStorage.memos ? JSON.parse(localStorage.memos) : null;
	};
	
	
}

