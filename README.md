# TMON FE CORDING TEST
> 티켓 몬스터 FE 직군 경력 입사 테스트

## Content
1. [개발 환경](#dev-spec)
2. [디렉터리 구조 설명](#folder-sturcture)
2. [설치 및 실행 방법](#installation)
3. [Dependencies](#dependencies)
4. [과제 요구사항](#requirement)
5. [구현 내용](#solution)

<h3 id="dev-spec">
    1. 개발 환경
</h3>

* HTML5
* Javascript
* CSS 

<h3 id="folder-sturcture">
    2 디렉터리 구조 설명
</h3>

```bash
└── TMON FE CORDING TEST
    ├── img                         # 이미지 저장 폴더
    ├── style                       # css파일 저장 폴더
    └── js                          # js파일 저장 푤더   
         ├── jquery-3.3.1.min.js    # jquery core 최신버전
         ├── Memo.js                # Memo class 로직이 있는 file
         ├── MemoService.js         # Memo Service 로직이 있는 file  
         └── script.js              # answer.html에서 로드하는 스크립트 file
    ├── answer.html                 
    └── question.html             
```

<h3 id="installation">
    3. 설치 및 실행 방법
</h3>

* 라이브 서버는 따로 구축하지 않았습니다. 파일시스템에서 answer.html 불러올 경우 script의 CORS issue 때문에 실행되지 않습니다.

* 이를 위하여 aws s3에 파일을 업로드해 두었습니다. 
[코딩테스트 실행하기](http://www.tmonfetest.co.kr.s3-website.ap-northeast-2.amazonaws.com/)

<h3 id="dependencies">
    4. Dependencies
</h3>

|  Dependency  | version |
|--------------|---------|
| jquery    |   3.3.1   |

<h3 id="requirement">
    5. 과제 요구사항
</h3>

* 바탕화면(쪽지가 아닌 회색부분)에 마우스 우클릭시 마우스 위치가 top, left값을 가지는 새로운 쪽지를 생성합니다. answer.html 참고(기본 크기 div.textarea : width:200px, height:100px;)
* 쪽지의 헤더 부분 드래그시 쪽지를 바탕화면 내에서 이동이 가능해야합니다.(Drag & Drop 플러그인 사용금지, 직접구현해야 함)
* 드래그 드랍 또는 내용 수정시에 해당하는 쪽지는 겹쳐진 쪽지 중 최상단으로 나와야합니다.
* X 버튼 클릭시 삭제 되어야합니다.
* 쪽지 우 하단 드래그시 크기가 변경되어야 합니다. 크기 변경은 div.textarea의 width, height가 변경되어야 합니다.
* 모든 쪽지 내용, 위치, 크기, 쌓이는 순서는 localStorage에 저장되어야 하며, 리로드시 모든 쪽지가 그대로 나와야합니다.

<h3 id="solution">
    6. 구현 내용
</h3>

* 메모(쪽지)를 하나의 class로 만들고, 인스턴스가 생성될 때마다 그에 필요한 DOM과 이벤트 핸들러들이 바인딩 됩니다.
* 모든 메모의 내용, 위치, 크기, 쌓이는 순서는 localStorage에 저장하였으며, 추가로 메모당 고유한 id값 부여합니다. 메모 모델의 형태는 다음과 같습니다.

```bash
  memo = {
    identifier: 'memo_1',
    content: '메모 하세요!',
    position: {
      top: 0,
      left: 0
    },
    size: {
      width: 0,
      height: 0
    },
    order: 1
  }
```

* 메모의 데이터에 대한 CRUD 로직을 공통 함수로 추출 하고 이를 MemoService.js에 구현하였습니다.
* 더 나아가 동기로 작업을 처리 하기 위해 Promise로 구현하였습니다. (추후 서버로부터 api call을 고려 하였습니다)
* 드래드 드랍에 대한 이벤트는 처음에는 jquery로 구현하였으나(jquery-ui는 사용하지 않음) 이벤트가 부자연 스러워 HTML5 DragNDrop API로 코드를 리팩토링하였습니다.
* 리사이즈 역시 javascript로만 구현하였습니다.
* 메모를 최상단으로 배치시키기 위하여 findHighestOrder라는 function을 구현하였습니다. 본 함수에서는 저장된 메모 리스트의 가장 높은 순서를 리턴 합니다. 이후 active한 메모의 order값을 수정 한 다음 z-index에 바인딩 합니다.
* 마지막으로 메모의 이동범위를 브라우저 영역 안 쪽으로 제한하였습니다.




