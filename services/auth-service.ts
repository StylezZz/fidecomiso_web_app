// Servicio de autenticación con datos simulados
import { delay } from "@/lib/utils"

// Usuario simulado
const mockUser = {
  id: "user1",
  name: "Admin PLG",
  email: "admin@plg.com",
  role: "admin",
}

// Token simulado
const mockToken = "mock-jwt-token-12345"

export const authService = {
  async login(email: string, password: string) {
    // Simular delay de red
    await delay(1000)

    // Simular validación básica
    if (email === "admin@plg.com" && password === "password") {
      localStorage.setItem("token", mockToken)
      return mockUser
    }

    throw new Error("Credenciales inválidas")
  },

  async logout() {
    // Simular delay de red
    await delay(500)
    localStorage.removeItem("token")
  },

  async getCurrentUser() {
    // Simular delay de red
    await delay(800)

    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No token found")
    }

    return mockUser
  },
}
