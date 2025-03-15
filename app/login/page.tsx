"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from "@/utils/supabase" // Make sure this import points to your Supabase client
import { toast } from "@/components/ui/use-toast" // Import toast for notifications
import Header from "../components/Header"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
})

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })  
      console.log(data)
      console.log(values.email)
      console.log(values.password)
      if (error) {
        throw error
      }
      
      // If successful, show success notification
      toast({
        title: "Login successful",
        description: "You have been signed in.",
      })
      const { data: { user } } = await supabase.auth.getUser()
      console.log(user)
      // Redirect to dashboard or home page after successful login
      router.push("/dashboard")
      
    } catch (error: any) {
      console.error("Login error:", error)
      
      // Show different error messages based on the error
      if (error.message.includes("Invalid login credentials")) {
        toast({
          title: "Login failed",
          description: "Incorrect email or password. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Login failed",
          description: error.message || "An error occurred while signing in.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <Header/>
    <div className="bg-background flex flex-col items-center justify-center p-4 ">
      
      <div className="w-full max-w-md">
        <Link href="/" prefetch={true} className="inline-flex items-center text-primary mb-6 hover:underline" >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
              <CardDescription className="text-center">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                <Link href="/reset-password" prefetch={true} className="text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <div className="text-sm text-center">
                Don&apos;t have an account?{" "}
                <Link href="/register" prefetch={true} className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
    </div>
  )
}