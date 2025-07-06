import { delay } from "@/lib/utils"

// Tipos para los clientes
export interface Client {
  id: string
  name: string
  type: "natural" | "juridico" | "gubernamental" | "otro"
  ruc?: string
  dni?: string
  address: string
  email?: string
  phone?: string
  contactPerson?: string
}

// Datos simulados de clientes
const clientsData: Client[] = [
  {
    id: "client1",
    name: "Empresa ABC",
    type: "juridico",
    ruc: "20123456789",
    address: "Av. Industrial 123, San Isidro, Lima",
    email: "contacto@empresaabc.com",
    phone: "999-888-777",
    contactPerson: "Juan Pérez",
  },
  {
    id: "client2",
    name: "Restaurante XYZ",
    type: "juridico",
    ruc: "20987654321",
    address: "Jr. Salaverry 456, Miraflores, Lima",
    email: "gerencia@restaurantexyz.com",
    phone: "999-777-888",
    contactPerson: "María López",
  },
  {
    id: "client3",
    name: "Hotel Miraflores",
    type: "juridico",
    ruc: "20456789123",
    address: "Av. Larco 789, Miraflores, Lima",
    email: "operaciones@hotelmiraflores.com",
    phone: "999-666-555",
    contactPerson: "Carlos Rodríguez",
  },
  {
    id: "client4",
    name: "Clínica San Pablo",
    type: "juridico",
    ruc: "20345678912",
    address: "Av. El Polo 789, Surco, Lima",
    email: "logistica@clinicasanpablo.com",
    phone: "999-555-444",
    contactPerson: "Ana Gómez",
  },
  {
    id: "client5",
    name: "Supermercado Metro",
    type: "juridico",
    ruc: "20234567891",
    address: "Av. La Marina 1234, San Miguel, Lima",
    email: "almacen@metro.com",
    phone: "999-444-333",
    contactPerson: "Luis Torres",
  },
  {
    id: "client6",
    name: "Pedro Suárez",
    type: "natural",
    dni: "45678912",
    address: "Calle Los Pinos 567, La Molina, Lima",
    email: "pedro.suarez@gmail.com",
    phone: "999-333-222",
  },
  {
    id: "client7",
    name: "Municipalidad de Lima",
    type: "gubernamental",
    ruc: "20131380951",
    address: "Jr. de la Unión 300, Cercado de Lima",
    email: "logistica@munlima.gob.pe",
    phone: "999-222-111",
    contactPerson: "Jorge Ramírez",
  },
  {
    id: "client8",
    name: "Colegio San Agustín",
    type: "otro",
    ruc: "20567891234",
    address: "Av. Javier Prado 2345, San Isidro, Lima",
    email: "administracion@sanagustin.edu.pe",
    phone: "999-111-000",
    contactPerson: "Carmen Velasco",
  },
]

export const clientsService = {
  async getClients() {
    // Simular delay de red
    await delay(800)
    return clientsData
  },

  async getClientById(id: string) {
    // Simular delay de red
    await delay(500)

    const client = clientsData.find((client) => client.id === id)
    if (!client) {
      throw new Error("Client not found")
    }

    return client
  },

  async searchClients(query: string) {
    // Simular delay de red
    await delay(300)

    if (!query) return clientsData

    const lowercaseQuery = query.toLowerCase()
    return clientsData.filter(
      (client) =>
        client.name.toLowerCase().includes(lowercaseQuery) ||
        client.id.toLowerCase().includes(lowercaseQuery) ||
        client.ruc?.toLowerCase().includes(lowercaseQuery) ||
        client.dni?.toLowerCase().includes(lowercaseQuery),
    )
  },

  async createClient(clientData: Omit<Client, "id">) {
    // Simular delay de red
    await delay(1000)

    // Generar un ID único
    const newId = `client${clientsData.length + 1}`

    const newClient: Client = {
      id: newId,
      ...clientData,
    }

    // En un sistema real, aquí se guardaría en la base de datos
    clientsData.push(newClient)

    return newClient
  },
}
