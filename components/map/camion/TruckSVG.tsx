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
              {/* Fondo cuadrado con bordes redondeados */}
              <rect x="-8" y="-8" width="16" height="16" fill="#3b82f6" stroke="white" strokeWidth="2" rx="3" ry="3"/>
              
              {/* Techo triangular */}
              <path d="M-8 -8 L0 -14 L8 -8 Z" fill="#1e40af" stroke="white" strokeWidth="1.5"/>
              
              {/* Puerta */}
              <rect x="-3" y="0" width="6" height="8" fill="white" stroke="#3b82f6" strokeWidth="0.5"/>
              
              {/* Ventanas laterales */}
              <rect x="-6" y="-6" width="2" height="2" fill="white" stroke="#3b82f6" strokeWidth="0.5"/>
              <rect x="4" y="-6" width="2" height="2" fill="white" stroke="#3b82f6" strokeWidth="0.5"/>
              
              {/* Indicador de almacén intermedio */}
              <circle cx="0" cy="-12" r="1.5" fill="white" stroke="#1e40af" strokeWidth="0.5"/>
          </g>
      </svg>
  )
}

export const HomeSVG = () =>{
  return(
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="-18 -32 64 64" width="30" height="30">
          <g>
              {/* Fondo hexagonal */}
              <path d="M0 -15 L10 -7.5 L10 7.5 L0 15 L-10 7.5 L-10 -7.5 Z" fill="#1e40af" stroke="white" strokeWidth="2"/>
              
              {/* Estrella central */}
              <g transform="translate(0, 0)">
                  <polygon points="0,-8 2.5,-2.5 8,-2.5 4,2 6.5,8 0,4 -6.5,8 -4,2 -8,-2.5 -2.5,-2.5" fill="white" stroke="#1e40af" strokeWidth="1"/>
              </g>
              
              {/* Icono de almacén central */}
              <rect x="-5" y="-7" width="10" height="14" fill="transparent" stroke="white" strokeWidth="1.5"/>
              
              {/* Puerta */}
              <rect x="-2" y="3" width="4" height="4" fill="white" stroke="#1e40af" strokeWidth="0.5"/>
              
              {/* Ventanas */}
              <rect x="-4" y="-5" width="2" height="2" fill="white" stroke="#1e40af" strokeWidth="0.5"/>
              <rect x="2" y="-5" width="2" height="2" fill="white" stroke="#1e40af" strokeWidth="0.5"/>
          </g>
      </svg>
  )
}