import { Block } from "@/interfaces/map/block.interface";
import { Node } from "@/interfaces/map/node.interface";
import { EstadoPedido, Pedido } from "@/interfaces/order/pedido.interface";
export const readFilePedidos = (content: string) : Pedido[] => {
    const lines = content.split('\n');
    const pedidos:  Pedido[] = [];

    for(const line of lines){
        if(!line.trim())continue;

        try{
            const [timeString,pedidoData] =  line.split(':');
            const [posX,posY,clientCode,quantityGP,limitTime] = pedidoData.split(',');

            const times = timeString.match(/(\d+)d(\d+)h(\d+)m/);
            if(!times){
                throw new Error("Error de lectura");
            }
            const day:number = parseInt(times[1]);
            const hour : number = parseInt(times[2]);
            const minute:number = parseInt(times[3]);

            const numGP : number = parseFloat(quantityGP.replace('m3',''));
            const limitHour : number = parseFloat(limitTime.replace('h',''));
            const ubicacion : Node = {x:parseInt(posX),y:parseInt(posY),isBloq:true};
            //const id: number = parseInt(clientCode.replace('c-','')); <- el id del pedido se obtiene despues
            const dateNow : Date =  new Date();
            const dateNowYear : number = dateNow.getFullYear();
            const dateNowMonth : number = dateNow.getMonth()+1;
            const fechaRegistro = new Date(dateNowYear, dateNowMonth, day, hour, minute);
            let pedido : Pedido ={
                fechaRegistro: fechaRegistro.toISOString(),
                ubicacion:ubicacion,
                volumenGLP:numGP,
                estado : EstadoPedido.PENDIENTE,
                plazoHoras:limitHour,
                clientCode:clientCode
            };
            pedidos.push(pedido);
        }
        catch(error){
            console.log(error);
        }
    }
    
    return pedidos;
}


export const readFileBloqueos = (content : string) : Block[] =>{

    const lines = content.split('\n');
    const bloqueos : Block[] =[];

    for(let line of lines){
        if(!line.trim())continue;
        try{
            const [times,nodesString] = line.split(':');
            const [initTime,finTIme] = times.split('-');
            const timeInit = initTime.match(/(\d+)d(\d+)h(\d+)m/);
            const timeFin = finTIme.match(/(\d+)d(\d+)h(\d+)m/);
            if(!timeInit || !timeFin){
                throw new Error("Error de lectura");
            }
            const dayInit = parseInt(timeInit[1]);
            const hourInit = parseInt(timeInit[2]);
            const minInit = parseInt(timeInit[3]);
            const dayFin = parseInt(timeFin[1]);
            const hourFin = parseInt(timeFin[2]);
            const minFin = parseInt(timeFin[3]);
            const numbers = nodesString.split(',').map(n => parseInt(n.trim()));
            const nodesBloqueo : Node[] = [];
            for (let i = 0; i < numbers.length; i += 2) {
                const node: Node = {
                    x: numbers[i],
                    y: numbers[i + 1],
                    isBloq: true
                };
                nodesBloqueo.push(node);
            }


            let bloqueo: Block = {
                diaRFin: dayFin,
                horaRFin:hourFin,
                minRFin:minFin,
                diaRIni: dayInit,
                horaRIni:hourInit,
                minRIni:minInit,
                nodosBloqueados:nodesBloqueo
            }
            bloqueos.push(bloqueo);
        }
        catch(error){
            console.log(error);
        }
    }
    return bloqueos;
}


export  async function obtenerArchivoConPrimerasNLineas(originalFile: File): Promise<File> {
  const texto = await originalFile.text(); // Leer el contenido como texto
  const lineas = texto.split(/\r?\n/);     // Separar en líneas
  const primeras100 = lineas.slice(0, 100).join('\n'); // Tomar solo 100
  const nuevoArchivo = new File([primeras100], originalFile.name.replace(/(\.\w+)?$/, '_100lineas.txt'), {
    type: originalFile.type,
    lastModified: Date.now(),
  });
  return nuevoArchivo;
}


export function obtenerMesDesdeNombre(nombreArchivo: string): number | null {
  const match = nombreArchivo.match(/\b20\d{2}(0[1-9]|1[0-2])\b/);
  if (!match) return null;
  console.log("Este es el mes obtenido", parseInt(match[0].slice(4, 6), 10))
  return parseInt(match[0].slice(4, 6), 10); // MM
}

export function obtenerAnioDesdeNombre(nombreArchivo: string): number | null {
  const match = nombreArchivo.match(/\b(20\d{2})(0[1-9]|1[0-2])\b/);
  if (!match) return null;
  console.log("Este es el anio obtenido", parseInt(match[1],10))
  return parseInt(match[1], 10); // YYYY
}
export function obtenerAnioArchPedido(nombreArchivo: string): number {
  const match = nombreArchivo.match(/ventas(\d{4})\d{2}\.txt/);
  return match ? parseInt(match[1], 10) : 0;
}
export function obtenerMesArchPedido(nombreArchivo: string): number {
  const match = nombreArchivo.match(/ventas\d{4}(\d{2})\.txt/);
  return match ? parseInt(match[1], 10) : 0;
}