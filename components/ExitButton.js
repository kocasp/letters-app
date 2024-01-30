import * as React from "react"
import Svg, { G, Rect, Path } from "react-native-svg"

function ExitButton(props) {
    return (
        <Svg
          width="45px"
          height="45px"
          viewBox="0 0 71 73"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <G stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
            <Rect
              stroke="#D9D9D9"
              fill="#D9D9D9"
              x={0.5}
              y={0.5}
              width={70}
              height={72}
              rx={33}
            />
            <Path
              fill="#FFF"
              fillRule="nonzero"
              d="M32.6811523 43L36.293 37.657 36.3457031 37.65625 39.9082031 43 41.9121094 43 37.384 36.358 37.3847656 36.3203125 42.0141602 29.612793 40.1123047 29.612793 36.494 35.003 36.4384766 35.0029297 32.8574219 29.612793 30.8442383 29.612793 35.3530273 36.2368164 35.353 36.276 30.7885742 43z"
            />
          </G>
        </Svg>
      )
    }

export default ExitButton
