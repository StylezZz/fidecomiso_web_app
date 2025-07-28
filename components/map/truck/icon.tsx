interface Props {
  color: string;
}

export const TruckSVG = ({ color }: Props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="16"
      viewBox="0 0 24 16"
      transform="rotate(ANGULAR_ROTATION)"
    >
      {/* Definir sombra */}
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="1"
            dy="1"
            stdDeviation="0.5"
            flood-color="#000000"
            flood-opacity="0.3"
          />
        </filter>
      </defs>

      {/* Sombra del camión en el suelo */}
      <ellipse cx="12" cy="15" rx="10" ry="1.5" fill="#000000" opacity="0.2" />

      {/* Compartimento de carga (atrás) */}
      <rect
        x="8"
        y="4"
        width="14"
        height="8"
        rx="1"
        fill={color}
        stroke="#333"
        strokeWidth="0.5"
        filter="url(#shadow)"
      />

      {/* Cabina del conductor (adelante) */}
      <rect x="2" y="6" width="7" height="6" rx="1" fill={color} stroke="#333" strokeWidth="0.5" />

      {/* Parabrisas */}
      <rect
        x="2.5"
        y="6.5"
        width="3"
        height="3"
        rx="0.3"
        fill="#87CEEB"
        stroke="#333"
        strokeWidth="0.3"
        opacity="0.8"
      />

      {/* Ventana lateral de la cabina */}
      <rect
        x="6"
        y="7"
        width="2.5"
        height="2.5"
        rx="0.3"
        fill="#87CEEB"
        stroke="#333"
        strokeWidth="0.3"
        opacity="0.8"
      />

      {/* Parrilla frontal */}
      <rect
        x="0.5"
        y="7.5"
        width="1.5"
        height="3"
        rx="0.2"
        fill="#333"
        stroke="#222"
        strokeWidth="0.2"
      />

      {/* Rueda delantera */}
      <circle cx="5" cy="12.5" r="2" fill="#333" stroke="#000" strokeWidth="0.5" />
      <circle cx="5" cy="12.5" r="1.2" fill="#666" />

      {/* Rueda trasera */}
      <circle cx="16" cy="12.5" r="2" fill="#333" stroke="#000" strokeWidth="0.5" />
      <circle cx="16" cy="12.5" r="1.2" fill="#666" />

      {/* Detalles de las ruedas (llantas) */}
      <circle cx="5" cy="12.5" r="0.6" fill="#999" opacity="0.6" />
      <circle cx="16" cy="12.5" r="0.6" fill="#999" opacity="0.6" />

      {/* Faro delantero */}
      <circle
        cx="1.5"
        cy="9"
        r="0.8"
        fill="#FFFFE0"
        stroke="#FFA500"
        strokeWidth="0.3"
        opacity="0.9"
      />

      {/* Línea de separación entre cabina y carga */}
      <line x1="8" y1="4" x2="8" y2="12" stroke="#333" strokeWidth="0.5" opacity="0.7" />

      {/* Pequeños detalles de la carrocería */}
      <rect x="10" y="5" width="8" height="1" rx="0.2" fill="#333" opacity="0.3" />

      {/* Manija de la puerta */}
      <circle cx="7.5" cy="9" r="0.3" fill="#333" />
    </svg>
  );
};

export const PedidoSVG = () => {
  return (
    <svg
      x="x-8"
      y="y-12"
      width="28"
      height="28"
      viewBox="0 0 120 160"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="topGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#FFD700", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#FFA500", stopOpacity: 1 }} />
        </linearGradient>

        <linearGradient id="leftGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#FF8C00", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#FF6B35", stopOpacity: 1 }} />
        </linearGradient>

        <linearGradient id="rightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#FF6B35", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#E55100", stopOpacity: 1 }} />
        </linearGradient>

        <linearGradient id="labelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#2196F3", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#1976D2", stopOpacity: 1 }} />
        </linearGradient>

        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.3" />
        </filter>
      </defs>

      <ellipse cx="60" cy="145" rx="25" ry="8" fill="#000000" opacity="0.2" />

      <polygon
        points="10,45 60,10 110,45 60,80"
        fill="url(#topGradient)"
        stroke="#E65100"
        stroke-width="2"
        filter="url(#shadow)"
      />

      <polygon
        points="10,45 10,110 60,145 60,80"
        fill="url(#leftGradient)"
        stroke="#E65100"
        stroke-width="2"
      />

      <polygon
        points="110,45 110,110 60,145 60,80"
        fill="url(#rightGradient)"
        stroke="#E65100"
        stroke-width="2"
      />

      <polygon
        points="35,20 75,20 75,55 35,60"
        fill="url(#labelGradient)"
        stroke="#1565C0"
        stroke-width="1.5"
      />

      <polygon
        points="35,60 35,125 45,135 45,70"
        fill="#1565C0"
        stroke="#1565C0"
        stroke-width="1"
      />

      <polygon
        points="75,55 75,120 85,130 85,65"
        fill="#0D47A1"
        stroke="#1565C0"
        stroke-width="1"
      />

      <polygon
        points="75,55 85,65 85,130 75,120"
        fill="#0D47A1"
        stroke="#1565C0"
        stroke-width="1"
      />

      <polygon points="15,42 55,15 100,42 60,75" fill="#FFFFFF" opacity="0.25" />

      <polygon points="43,28 67,28 67,42 43,45" fill="#FFFFFF" opacity="0.9" />
      <polygon points="46,32 62,32 62,34 46,34.5" fill="#1565C0" />
      <polygon points="46,36 58,36 58,38 46,38.3" fill="#1565C0" />
      <polygon points="46,40 54,40 54,42 46,42.2" fill="#1565C0" />

      <circle cx="40" cy="25" r="3" fill="#FFFFFF" opacity="0.6" />
    </svg>
  );
};

export const WarehouseSVG = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -30 64 64" width="30" height="30">
      <g>
        {/* Fondo cuadrado con bordes redondeados */}
        <rect
          x="-8"
          y="-8"
          width="16"
          height="16"
          fill="#3b82f6"
          stroke="white"
          strokeWidth="2"
          rx="3"
          ry="3"
        />

        {/* Techo triangular */}
        <path d="M-8 -8 L0 -14 L8 -8 Z" fill="#1e40af" stroke="white" strokeWidth="1.5" />

        {/* Puerta */}
        <rect x="-3" y="0" width="6" height="8" fill="white" stroke="#3b82f6" strokeWidth="0.5" />

        {/* Ventanas laterales */}
        <rect x="-6" y="-6" width="2" height="2" fill="white" stroke="#3b82f6" strokeWidth="0.5" />
        <rect x="4" y="-6" width="2" height="2" fill="white" stroke="#3b82f6" strokeWidth="0.5" />

        {/* Indicador de almacén intermedio */}
        <circle cx="0" cy="-12" r="1.5" fill="white" stroke="#1e40af" strokeWidth="0.5" />
      </g>
    </svg>
  );
};

export const HomeSVG = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-18 -32 64 64" width="30" height="30">
      <g>
        {/* Fondo hexagonal */}
        <path
          d="M0 -15 L10 -7.5 L10 7.5 L0 15 L-10 7.5 L-10 -7.5 Z"
          fill="#1e40af"
          stroke="white"
          strokeWidth="2"
        />

        {/* Estrella central */}
        <g transform="translate(0, 0)">
          <polygon
            points="0,-8 2.5,-2.5 8,-2.5 4,2 6.5,8 0,4 -6.5,8 -4,2 -8,-2.5 -2.5,-2.5"
            fill="white"
            stroke="#1e40af"
            strokeWidth="1"
          />
        </g>

        {/* Icono de almacén central */}
        <rect
          x="-5"
          y="-7"
          width="10"
          height="14"
          fill="transparent"
          stroke="white"
          strokeWidth="1.5"
        />

        {/* Puerta */}
        <rect x="-2" y="3" width="4" height="4" fill="white" stroke="#1e40af" strokeWidth="0.5" />

        {/* Ventanas */}
        <rect x="-4" y="-5" width="2" height="2" fill="white" stroke="#1e40af" strokeWidth="0.5" />
        <rect x="2" y="-5" width="2" height="2" fill="white" stroke="#1e40af" strokeWidth="0.5" />
      </g>
    </svg>
  );
};
