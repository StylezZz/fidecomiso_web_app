"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image";
import { useToast } from "@/hooks/use-toast"
import { Gauge, Lock,Mail, Shield, Zap,ArrowRight} from "lucide-react"
import { useRouter } from "next/navigation"
const formSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
})

type FormValues = z.infer<typeof formSchema>

export function LoginForm() {
  const { login ,isAuthenticated,isLoading: isLoadingAuth} = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(()=>{
    console.log("Entro al useefect");
    if(!isAuthenticated)router.push("/login");
    else router.push("/dashboard");
  },[isLoadingAuth]);


  async function onSubmit(data: FormValues) {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema de logística PLG",
      })
    } catch (error) {
      toast({
        title: "Error de inicio de sesión",
        description: "Credenciales inválidas. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex">
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0">
          {/*Weada insana de proyectos anteriores con los pibes*/ }
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800/50 to-transparent animate-pulse-slow"></div>

          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-gray-600/20 to-gray-700/10 rounded-full blur-xl animate-float-1"></div>

            <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-br from-gray-500/15 to-gray-600/5 rounded-full blur-2xl animate-float-2"></div>

            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-gray-400/25 to-gray-500/10 rounded-full blur-lg animate-float-3"></div>

            <div className="absolute top-1/6 right-1/3 w-16 h-64 bg-gradient-to-b from-gray-600/10 to-transparent rotate-12 animate-slide-vertical"></div>

            <div className="absolute bottom-1/4 left-1/6 w-20 h-40 bg-gradient-to-t from-gray-500/15 to-transparent -rotate-12 animate-slide-vertical-reverse"></div>
          </div>

          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent animate-slide-horizontal"></div>
            <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent animate-slide-horizontal-reverse"></div>
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent animate-slide-horizontal"></div>
            <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent animate-slide-horizontal-reverse"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent animate-slide-horizontal"></div>
          </div>

          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-12 gap-8 h-full p-8 animate-fade-in-out">
              {Array.from({ length: 60 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Gestiona tus
              <span className="text-gray-300 block">Simulaciones</span>
              de manera inteligente
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Optimiza tus procesos logísticos con simulaciones avanzadas y análisis en tiempo real.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-gray-700/30 rounded-xl backdrop-blur-sm group-hover:bg-gray-600/40 transition-all duration-300">
                  <Zap className="w-6 h-6 text-gray-300" />
                </div>
                <span className="text-lg text-gray-300">Simulaciones en tiempo real</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-gray-700/30 rounded-xl backdrop-blur-sm group-hover:bg-gray-600/40 transition-all duration-300">
                  <Gauge className="w-6 h-6 text-gray-300" />
                </div>
                <span className="text-lg text-gray-300">Análisis de rendimiento</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-gray-700/30 rounded-xl backdrop-blur-sm group-hover:bg-gray-600/40 transition-all duration-300">
                  <Shield className="w-6 h-6 text-gray-300" />
                </div>
                <span className="text-lg text-gray-300">Datos seguros y confiables</span>
              </div>
            </div>
          </div>
        </div>    
    </div> 
    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white flex-col gap-4">
    <div className="relative w-20 h-20 flex-shrink-0">
      <Image
        src="/truck-hd.png"
        alt="PLG Software Logo"
        fill
        className="object-contain rounded-sm"
        priority
      />
    </div>
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">¡Bienvenido!</h2>
      <p className="text-gray-600 text-center">Accede a tu cuenta para continuar</p>
    </div>
    <Card className="w-full max-w-md pt-3 shadow-xl max-h-[400px] min-h-[300px]">
      <CardHeader>
        <h1 className="font-bold text-center text-gray-900 text-xl">Iniciar sesión</h1>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-gray-600">Correo electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="usuario@plg.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-gray-600">Contraseña</FormLabel>
                  <FormControl>
                    <Input placeholder="*******" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              <ArrowRight className="hover:-translate-x-4"/>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
    </div> 
    </div>
  )
}
