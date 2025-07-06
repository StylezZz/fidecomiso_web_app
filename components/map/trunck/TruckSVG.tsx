interface Props{
  color: string
}

export const TruckSVG =({color} : Props) =>{
  return(
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="35" viewBox="-16 -30 40 70" transform="rotate(ANGULAR_ROTATION)">
          <g>
              <rect x="-15" y="-25" width="30" height="50" rx="3" ry="3" fill={`${color}`} stroke="white" strokeWidth="2" />
              
              <rect x="-15" y="-25" width="30" height="15" rx="3" ry="3" fill="#333" stroke="white" strokeWidth="1" />

              <polygon points="0,-22.5 -6,-11 6,-11" fill="white" transform="rotate(239, 0, -14.5)" />

              <rect x="-10" y="-5" width="20" height="25" rx="1" ry="1" fill="#333" />

              <rect x="-17" y="-15" width="4" height="8" rx="1" ry="1" fill="black" stroke="white" strokeWidth="0.5" />
              <rect x="13" y="-15" width="4" height="8" rx="1" ry="1" fill="black" stroke="white" strokeWidth="0.5" />
              <rect x="-17" y="10" width="4" height="8" rx="1" ry="1" fill="black" stroke="white" strokeWidth="0.5" />
              <rect x="13" y="10" width="4" height="8" rx="1" ry="1" fill="black" stroke="white" strokeWidth="0.5" />
          </g>
      </svg>
  )
}

export const PedidoSVG = ()=>{
  return(
      <svg x="x-7" y="y-10" width="23" height="23" viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
          <polygon 
              points="0,40 48,0 96,40 48,80"
              fill="#f4c167"
              stroke="#a05a2c"
              strokeWidth="2"
          />

          <polygon 
              points="0,40 0,100 48,140 48,80"
              fill="#d98c30"
              stroke="#a05a2c"
              strokeWidth="2"
          />

          <polygon 
              points="96,40 96,100 48,140 48,80"
              fill="#b87333"
              stroke="#a05a2c"
              strokeWidth="2"
          />

          <polygon 
              points="36,10 60,10 60,70 36,78"
              fill="#a05a2c"
          />

          <polygon 
              points="36,78 36,138 60,130 60,70"
              fill="#804000"
          />
      </svg>
  )
}

export const WarehouseSVG =() =>{
  return(
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -30 64 64" width="30" height="30">
          <g>
              <circle cx="0" cy="0" r="20" fill="#D97706" />
              <g transform="translate(-12, -12)">
                  <rect
                      x="6"
                      y="10"
                      width="12"
                      height="12"
                      fill="transparent"
                      stroke="white"
                      strokeWidth="2"
                  />

                  <path
                      d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"
                      fill="transparent"
                      stroke="white"
                      strokeWidth="2"
                  />

                  <line x1="6" y1="18" x2="18" y2="18" stroke="white" strokeWidth="2"/>
                  <line x1="6" y1="14" x2="18" y2="14" stroke="white" strokeWidth="2"/>
              </g>
          </g>
      </svg>
  )
}

export const HomeSVG = () =>{
  return(
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="-18 -32 64 64" width="30" height="30">
          <g>
              <circle cx="0" cy="0" r="20" fill="#1D4ED8" />

              <g transform="translate(-12, -12)">
                  <path
                      d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                      fill="transparent"
                      stroke="white"
                      strokeWidth="2"
                  />

                  <polyline
                      points="15,21 15,13 9,13 9,21"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                  />

                  <polyline
                      points="3,10 10,4 14,4 21,10"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                  />
              </g>
          </g>
      </svg>
  )
}