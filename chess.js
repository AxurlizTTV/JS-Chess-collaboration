// MAIN
$(function() {
  init();
  // console.log("Main init Called");
  ParseFen(START_FEN);
  PrintBoard();
});

function InitFilesRankdBrd() {
  let index = 0;
  let file = FILES.FILE_A;
  let rank = RANKS.RANK_1;
  let sq = SQUARES.A1;

  for(index = 0; index < BRD_SQ_NUM; ++index) {
    FilesBrd[index] = SQUARES.OFFBOARD;
    RanksBrd[index] = SQUARES.OFFBOARD;
  }

  for(rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
    for(file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
      sq = FR2SQ(file, rank);
      FilesBrd[sq] = file;
      RanksBrd[sq] = rank;
    }
  }

  // console.log("FilesBrd[0]:" + FilesBrd[0] + "RanksBrd[0];" + FilesBrd[0]);
  // console.log("FilesBrd[SQUARES.A1]:" + FilesBrd[SQUARES.A1] + "RanksBrd[SQUARES.A1];" + FilesBrd[SQUARES.A1]);
  // console.log("FilesBrd[SQUARES.E8]:" + FilesBrd[SQUARES.E8] + "RanksBrd[SQUARES.E8];" + FilesBrd[SQUARES.E8]);
};

function InitHashKeys() {
  let index = 0;

  for(index = 0; index < 14 * 120; ++index) {
    PieceKeys[index] = RAND_32();
  }

  SideKey = RAND_32();

  for(index = 0; index < 16; ++index) {
    CastleKeys[index] = RAND_32();
  }
}

function InitSq120To64() {
  let index = 0;
  let file = FILES.FILE_A;
  let rank = RANKS.RANK_1;
  let sq = SQUARES.A1;
  let sq64 = 0;

  for(index = 0; index < BRD_SQ_NUM; ++index) {
    Sq120ToSq64[index] = 65;
  }

  for(index = 0; index < 64; ++index) {
    Sq64ToSq120[index] = 120;
  }

  for(rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
    for(file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
      sq = FR2SQ(file, rank);
      Sq64ToSq120[sq64] = sq;
      Sq120ToSq64[sq] = sq64;
      sq64++;
    }
  }
}

function init() {
  // console.log("init() called")
  InitFilesRankdBrd();
  InitHashKeys();
};

// DEFS
const BRD_SQ_NUM = 120;

let PIECES =  { EMPTY : 0, wP : 1, wN : 2, wB : 3,wR : 4, wQ : 5, wK : 6, 
                bP : 7, bN : 8, bB : 9, bR : 10, bQ : 11, bK : 12  };

let FILES =  { FILE_A: 0, FILE_B: 1, FILE_C: 2, FILE_D: 3, FILE_E: 4,
               FILE_F: 5, FILE_G: 6, FILE_H: 7, FILE_NONE: 8 };             

let RANKS =  { RANK_1: 0, RANK_2: 1, RANK_3: 2, RANK_4: 3, RANK_5: 4,
               RANK_6: 5, RANK_7: 6, RANK_8: 7, RANK_NONE: 8 };

let COLORS = { WHITE: 0, BLACK: 1, BOTH: 2 };

let CASTLEBIT = { WKCA: 1, WQCA: 2, BKCA: 4, BQCA: 8 };

const SQUARES = {
  A1: 21, B1: 22, C1: 23, D1: 24, E1: 25, F1: 26, G1: 27, H1: 28,
  A8: 91, B8: 92, C8: 93, D8: 94, E8: 95, F8: 96, G8: 97, H8: 98,
  NO_SQ: 99, OFFBOARD: 100
};

let BOOL = { FALSE: 0, TRUE: 1};

let MAXGAMEMOVES = 2048;
let MAXPOSITIONMOVES = 256;
let MAXDEPTH = 64;

let FilesBrd = new Array(BRD_SQ_NUM);
let RanksBrd = new Array(BRD_SQ_NUM);

let START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

let PceChar = ".PNBRQKpnbrqk";
let SideChar = "wb-";
let RankChar = "12345678";
let FileChar = "abcdefgh";

function FR2SQ(f,r) {
  return ((21 + (f)) + ((r) * 10));
}

let PieceBig = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
let PieceMaj = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
let PieceMin = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
let PieceVal = [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000  ];
let PieceCol = [ COLORS.BOTH, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE,
	               COLORS.BLACK, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK ];
	
let PiecePawn = [ BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];	
let PieceKnight = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
let PieceKing = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE ];
let PieceRookQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];
let PieceBishopQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE ];
let PieceSlides = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];

let PieceKeys = new Array(14*120);
let SideKey;
let CastleKeys = new Array(16);

let Sq120ToSq64 = new Array(BRD_SQ_NUM);
let Sq64ToSq120 = new Array(64);

function RAND_32() {
  return (Math.floor((Math.random()*255)+1) << 23) | (Math.floor((Math.random()*255)+1) << 16)
         | (Math.floor((Math.random()*255)+1) << 8) | Math.floor((Math.random()*255)+1);
}

function SQ64(sq120) {
  return Sq120ToSq64[(sq120)];
}

function SQ120(sq64) {
  return Sq64ToSq120[(sq64)];
}

// BOARD
function PCEINDEX(pce, pceNum) {
  return (pce * 10 + pceNum);
}

let GameBoard = {};

GameBoard.pieces = new Array(BRD_SQ_NUM);
GameBoard.side = COLORS.WHITE;
GameBoard.fiftyMove = 0;
GameBoard.hisPly = 0;
GameBoard.ply = 0;
GameBoard.enPas = 0;
GameBoard.castlePerm = 0;
GameBoard.material = new Array(2); // WHITE/BLACK material of pieces
GameBoard.pceNum = new Array(13);
GameBoard.pList = new Array(14*10);
GameBoard.posKey = 0;
GameBoard.moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveListStart = new Array(MAXDEPTH);

function PrintBoard() {
  let sq, file, rank, piece;

  console.log("\nGame Board:\n");

  for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
    let line = (RankChar[rank] + " ");
    for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
      sq = FR2SQ(file, rank);
      piece = GameBoard.pieces[sq];
      line += (" " + PceChar[piece] + " ");
    }
    console.log(line);
  }

  console.log("");
  let line = " ";
  for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
    line += (' ' + FileChar[file] + ' ');
  }

  console.log(line);
  console.log("side: " + SideChar[GameBoard.side]);
  console.log("enPas: " + GameBoard.enPas);
  line = "";

  if(GameBoard.castlePerm & CASTLEBIT.WKCA) line += 'K';
  if(GameBoard.castlePerm & CASTLEBIT.WQCA) line += 'Q';
  if(GameBoard.castlePerm & CASTLEBIT.BKCA) line += 'k';
  if(GameBoard.castlePerm & CASTLEBIT.BQCA) line += 'q';
  console.log("castle: " + line);
  console.log("key: " + GameBoard.posKey.toString(16));
}

function GeneratePosKey() {
  let sq = 0;
  let finalKey = 0;
  let piece = PIECES.EMPTY;

  for(sq = 0; sq < BRD_SQ_NUM; ++sq) {
    piece = GameBoard.pieces[sq];
    if(piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD) {
      finalKey ^= PieceKeys[(piece * 120) + sq];
    }
  }

  if(GameBoard.side == COLORS.WHITE) {
    finalKey ^= SideKey;
  }

  if(GameBoard.enPas != SQUARES.NO_SQ) {
    finalKey ^= PieceKeys[GameBoard.enPas];
  }

  finalKey ^= CastleKeys[GameBoard.castlePerm];

  return finalKey;
}

function ResetBoard() {
  let index = 0;

  for(index = 0; index < BRD_SQ_NUM; ++index) {
    GameBoard.pieces[index] = SQUARES.OFFBOARD;
  }

  for(index = 0; index < 64; ++index) {
    GameBoard.pieces[SQ120(index)] = PIECES.EMPTY;
  }

  for(index = 0; index < 14 * 120; ++index) {
    GameBoard.pList[index] = PIECES.EMPTY;
  }

  for(index = 0; index < 2; ++index) {
    GameBoard.material[index] = 0;
  }

  for(index = 0; index < 13; ++index) {
    GameBoard.pceNum[index] = 0;
  }

  GameBoard.side = COLORS.BOTH;
  GameBoard.enPas = SQUARES.NO_SQ;
  GameBoard.fiftyMove = 0;
  GameBoard.ply = 0;
  GameBoard.hisPly = 0;
  GameBoard.castlePerm = 0;
  GameBoard.posKey = 0;
  GameBoard.moveListStart[GameBoard.ply] = 0;
}

function ParseFen(fen) {
  ResetBoard();

  let rank = RANKS.RANK_8;
  let file = FILES.FILE_A;
  let piece = 0;
  let count = 0;
  let i = 0;
  let sq120 = 0;
  let fenCnt = 0;
  
  while((rank >= RANKS.RANK_1) && fenCnt < fen.length) {
    count = 1;
    switch (fen[fenCnt]) {
      case 'p': piece = PIECES.bP; break;
      case 'r': piece = PIECES.bR; break;
      case 'n': piece = PIECES.bN; break;
      case 'b': piece = PIECES.bB; break;
      case 'k': piece = PIECES.bK; break;
      case 'q': piece = PIECES.bQ; break;
      case 'P': piece = PIECES.wP; break;
      case 'R': piece = PIECES.wR; break;
      case 'N': piece = PIECES.wN; break;
      case 'B': piece = PIECES.wB; break;
      case 'K': piece = PIECES.wK; break;
      case 'Q': piece = PIECES.wQ; break;

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
        piece = PIECES.EMPTY;
        count = fen[fenCnt].charCodeAt() - '0'.charCodeAt();
        break;

      case '/':
      case ' ':
        rank--;
        file = FILES.FILE_A;
        fenCnt++;
        continue;

      default:
        console.log("FEN error \n");
        return;
    }

    for(i = 0; i < count; i++) {
      sq120 = FR2SQ(file, rank);
      GameBoard.pieces[sq120] = piece;
      file++;
    }
    fenCnt++;
  }

  GameBoard.side = (fen[fenCnt] == 'w') ? COLORS.WHITE : COLORS.BLACK;
  fenCnt += 2;

  for(i = 0; i < 4; i++) {
    if (fen[fenCnt] == ' ') {
      break;
    }
    switch(fen[fenCnt]) {
      case 'K': GameBoard.castlePerm |= CASTLEBIT.WKCA; break;
      case 'Q': GameBoard.castlePerm |= CASTLEBIT.WQCA; break;
      case 'k': GameBoard.castlePerm |= CASTLEBIT.BKCA; break;
      case 'q': GameBoard.castlePerm |= CASTLEBIT.BQCA; break;
    }
    fenCnt++;
  }
  fenCnt++;

  if (fen[fenCnt] != '-') {
    file = fen[fenCnt].charCodeAt() - 'a'.charCodeAt();
    rank = fen[fenCnt + 1].charCodeAt() - '1'.charCodeAt();
    console.log("fen[fenCnt]: " + fen[fenCnt] + "File: " + file + "Rank: " + rank);
    GameBoard.enPas = FR2SQ(file, rank);
  }

  GameBoard.posKey = GeneratePosKey();
}