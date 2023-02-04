export interface IAstral  {
    type?: AstralBodies | string;
    color?: AstralColors;
    direction?: AstralDirection;
    row: number;
    column: number;
}

export enum AstralBodies {
    SPACE = "SPACE",
    POLYANET = "POLYANET",
    SOLOON = "SOLOON",
    COMETH = "COMETH"
}

export enum AstralBodiesCurrent {
    POLYANET = 0,
    SOLOON = 1,
    COMETH = 2
}

export enum AstralColors {
    BLUE = "blue",
    RED = "red",
    PURPLE = "purple",
    WHITE = "white"
}

export enum AstralDirection {
    UP = "up",
    DOWN = "down",
    RIGHT = "right",
    LEFT = "left"
}