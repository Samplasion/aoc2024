import run from "../deps.ts";
import Grid from "../grid.ts";
import * as utils from "../utils.ts";

const parseInput = (rawInput: string) => {
  const [rawGrid, rawMoves] = rawInput.trim().split("\n\n");

  return {
    grid: Grid.fromString(rawGrid),
    moves: rawMoves.split("\n").flatMap(line => line.split("")).map(letter => {
      return utils.Vector.from(letter)!.flipY();
    }),
  };
};

const part1 = (rawInput: string) => {
  const { grid, moves } = parseInput(rawInput);
  
  let robot = utils.Vector.fromPosition(grid.findIndex(value => value == "@")!);

  for (const move of moves) {
    let newPos = robot;
    do {
      newPos = newPos.add(move);
    } while (grid.get(newPos) == "O");

    // At this point, grid[newPos] is either a blank space or a wall

    if (grid.get(newPos) == "#") {
      continue;
    }

    // Push
    grid.set(robot, ".");
    grid.set(newPos, "O");
    grid.set(robot.add(move), "@");

    robot = robot.add(move);
  }
  
  return utils.sum(grid.map((value, x, y) => value == "O" ? x + 100 * y : 0));
};

const part2 = (rawInput: string) => {
  const { moves, grid: oldGrid } = parseInput(rawInput);
  const grid = new Grid(oldGrid.width * 2, oldGrid.height, '');

  oldGrid.forEach((value, x, y) => {
    let a, b;

    switch (value) {
      case "@":
        a = "@";
        b = ".";
        break;
      case "O":
        a = "[";
        b = "]";
        break;
      case "#":
        a = "#";
        b = "#";
        break;
      default:
        a = ".";
        b = ".";
        break;
    }

    grid.set(2*x, y, a);
    grid.set(2*x + 1, y, b);
  });

  let robot = utils.Vector.fromPosition(grid.findIndex(value => value == "@")!);

  // console.log(grid.toPrettyString());
  
  const [left, right] = "LR".split("").map(letter => utils.Vector.from(letter)!);
  for (const move of moves) {
    // deno-lint-ignore no-inner-declarations
    function _eventuallyClashes(curPos: utils.Vector): boolean {
      const nextMove = curPos.add(move);
      // console.log(move.toString(), "Checking", nextMove.toString());

      if (grid.get(curPos) == "#") {
        // console.log(move.toString(), "Found wall at", nextMove.toString());
        return true;
      }

      if (grid.get(curPos) == ".") {
        // console.log(move.toString(), "Found empty space at", nextMove.toString());
        return false;
      }

      if (grid.get(curPos) == "[") {
        return _eventuallyClashes(nextMove) || _eventuallyClashes(nextMove.add(right));
      }

      if (grid.get(curPos) == "]") {
        return _eventuallyClashes(nextMove) || _eventuallyClashes(nextMove.add(left));
      }

      throw new Error("Invalid grid");
    }
    
    let newPos = robot;
    do {
      newPos = newPos.add(move);

      if (move.isHorizontal) {
        if ("[]".includes(grid.get(newPos)!)) {
          continue;
        }
        if (grid.get(newPos) == ".") {
          break;
        }
        if (grid.get(newPos) == "#") {
          newPos = robot;
          break;
        }
      } else {
        const clash = _eventuallyClashes(newPos);
        if (!clash) {
          // Make sure the next position != the current position
          // so that the wall branch doesn't get triggered
          newPos = newPos.add(move);
          break;
        }
        newPos = robot;
        break;
      }
    } while (!newPos.eq(robot));

    if (newPos.eq(robot)) {
      // console.log(move.toString(), "\n" + grid.toPrettyString().trimEnd() + " Interrupted move\n");
      continue;
    }

    // Push
    if (move.isHorizontal) {
      grid.set(robot, ".");
      robot = robot.add(move);
      grid.set(robot, "@");
      if (!robot.subtract(move).isAdjacentTo(newPos)) {
        for (const pos of utils.Vector.intermediate(robot.add(move), newPos)) {
          let char;
          if (move.x > 0) {
            char = robot.subtract(pos).sqmag % 2 == 0 ? "]" : "[";
          } else {
            char = robot.subtract(pos).sqmag % 2 == 0 ? "[" : "]";
          }
          // console.log(robot.toString(), pos.toString(), robot.subtract(pos).sqmag, char);
          grid.set(pos, char);
        }
      }
    } else {
      // deno-lint-ignore no-inner-declarations
      function _recursivePush(pos: utils.Vector) {
        if (grid.get(pos) == ".") {
          return;
        }

        const nextPos = pos.add(move);
        const ourSide = grid.get(pos)!;
        const neighbor = ourSide == "[" ? right : left;

        if (grid.get(nextPos) == "#") {
          throw new Error("Invalid grid");
        }

        if ("[]".includes(grid.get(nextPos)!)) {
          _recursivePush(nextPos);
        }
        if ("[]".includes(grid.get(nextPos.add(neighbor))!)) {
          _recursivePush(nextPos.add(neighbor));
        }
        
        if (grid.get(nextPos) == ".") {
          // Shift the current box over
          grid.set(pos.add(move), grid.get(pos)!);
          grid.set(pos.add(move).add(neighbor), grid.get(pos.add(neighbor))!);
          grid.set(pos, ".");
          grid.set(pos.add(neighbor), ".");
        }
      }

      _recursivePush(robot.add(move));

      grid.set(robot, ".");
      grid.set(robot.add(move), "@");
      robot = robot.add(move);
    }


    // console.log(move.toString(), "\n" + grid.toPrettyString());

    // const errorCases = [".]", "]]", "[[", "[."];
    // if (errorCases.some(errorCase => grid.toPrettyString().includes(errorCase))) {
    //   throw new Error("Invalid state reached");
    // }
  }
  
  return utils.sum(grid.map((value, x, y) => value == "[" ? x + 100 * y : 0));
};

run({
  part1: {
    tests: [
      {
        input: `
########
#..O.O.#
##@.O..#
#...O..#
#.#.O..#
#...O..#
#......#
########

<^^>>>vv<v>>v<<
`.trim(),
        expected: 2028,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
##########
#..O..O.O#
#......O.#
#.OO..O.O#
#..O@..O.#
#O#..O...#
#O..O..O.#
#.OO.O.OO#
#....O...#
##########

<vv>^<v^>v>^vv^v>v<>v^v<v<^vv<<<^><<><>>v<vvv<>^v^>^<<<><<v<<<v^vv^v>^
vvv<<^>^v^^><<>>><>^<<><^vv^^<>vvv<>><^^v>^>vv<>v<<<<v<^v>^<^^>>>^<v<v
><>vv>v^v^<>><>>>><^^>vv>v<^^^>>v^v^<^^>v^^>v^<^v>v<>>v^v^<v>v^^<^^vv<
<<v<^>>^^^^>>>v^<>vvv^><v<<<>^^^vv^<vvv>^>v<^^^^v<>^>vvvv><>>v^<<^^^^^
^><^><>>><>^^<<^^v>>><^<v>^<vv>>v>>>^v><>^v><<<<v>>v<v<v>vvv>^<><<>^><
^>><>^v<><^vvv<^^<><v<<<<<><^v<<<><<<^^<v<^^^><^>>^<v^><<<^>>^v<v^v<v^
>^>>^v>vv>^<<^v<>><<><<v<<v><>v<^vv<<<>^^v^>^^>>><<^v>>v^v><^^>>^<>vv^
<><^^>^^^<><vvvvv^v<v<<>^v<v>v<<^><<><<><<<^^<<<^<<>><<><^^^>^^<>^>v<>
^^>vv<^v^v<vv>^<><v<^v>^^^>>>^^vvv^>vvv<>>>^<^>>>>>^<<^v>^vvv<>^<><<v>
v^^>>><<^^<>>^v^<v^vv<>v^<<>^<^v^v><^<<<><<^<v><v<>vv>>v><v^<vv<>v^<<^
`.trim(),
        expected: 9021,
      },
    ],
    solution: part2,
  },
  onlyTests: false,
});