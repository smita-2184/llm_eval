"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  Lock,
  BookOpen,
  GraduationCap,
  Calendar,
  XCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { registerUser } from "../actions/register-user"
import { checkUsernameExists } from "../actions/check-username"
import { motion } from "framer-motion"
import { useDebounce } from "use-debounce"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [debouncedUsername] = useDebounce(username, 500)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isUsernameTaken, setIsUsernameTaken] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [gender, setGender] = useState("Prefer not to say")
  const [course, setCourse] = useState("B.Sc")
  const [customCourse, setCustomCourse] = useState("")
  const [semester, setSemester] = useState("Semester 1")
  const [major, setMajor] = useState("")
  const [university, setUniversity] = useState("")
  const [showUniversitySuggestions, setShowUniversitySuggestions] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const router = useRouter()

  // Check username availability when it changes
  useEffect(() => {
    const validateUsername = async () => {
      if (debouncedUsername.trim().length < 3) {
        setIsUsernameTaken(false)
        return
      }

      setIsCheckingUsername(true)
      try {
        const exists = await checkUsernameExists(debouncedUsername)
        setIsUsernameTaken(exists)
      } catch (error) {
        console.error("Error validating username:", error)
      } finally {
        setIsCheckingUsername(false)
      }
    }

    validateUsername()
  }, [debouncedUsername])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !password.trim() || !major.trim() || !university.trim()) {
      setError("Please fill in all required fields")
      return
    }

    if (isUsernameTaken) {
      setError("Username is already taken. Please choose a different one.")
      return
    }

    if (!termsAccepted) {
      setError("You must agree to the terms and conditions")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await registerUser({
        username,
        password,
        gender,
        course: course === "Other" ? customCourse : course,
        semester,
        major,
        university,
      })

      if (result.success) {
        setSuccess(result.message)
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleUniversityChange = (value: string) => {
    setUniversity(value)
    // Show suggestions for partial matches
    const searchTerm = value.toLowerCase()
    setShowUniversitySuggestions(
      searchTerm.includes("illinois") || 
      searchTerm.includes("chicago") ||
      searchTerm.includes("uic") ||
      searchTerm.includes("uni") ||
      searchTerm.includes("unive") ||
      searchTerm.includes("university") ||
      searchTerm.includes("u of i") ||
      searchTerm.includes("u of illinois")
    )
  }

  const handleUniversitySuggestionClick = (suggestion: string) => {
    setUniversity(suggestion)
    setShowUniversitySuggestions(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-md border-none shadow-2xl bg-white/90 dark:bg-background/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {/* Top gradient header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10"></div>
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

              <h1 className="text-3xl font-bold text-center text-white mb-1 relative">Studium</h1>
              <p className="text-center text-white/80 text-sm">Empowering Research Through AI</p>
            </div>

            <div className="p-6 pt-8">
              <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Create Account</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="mb-4 border-destructive/20 bg-destructive/10">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="mb-4 border-green-500/20 bg-green-500/10">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-500">{success}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <div className="space-y-1">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`pl-10 h-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:border-transparent transition-all ${
                        isUsernameTaken
                          ? "border-red-500 focus:ring-red-500"
                          : username.length >= 3 && !isUsernameTaken && !isCheckingUsername
                            ? "border-green-500 focus:ring-green-500"
                            : "focus:ring-blue-500"
                      }`}
                      required
                    />
                    {username.length >= 3 && (
                      <div className="absolute right-3 top-3">
                        {isCheckingUsername ? (
                          <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                        ) : isUsernameTaken ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>

                  {isUsernameTaken && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-sm text-red-500 ml-1 mt-1"
                    >
                      Username is already taken. Please choose a different one.
                    </motion.p>
                  )}

                  {username.length > 0 && username.length < 3 && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-sm text-amber-500 ml-1 mt-1"
                    >
                      Username must be at least 3 characters long.
                    </motion.p>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-3 h-6 w-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400 mb-1.5 block font-medium">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Non-binary">Non-binary</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400 mb-1.5 block font-medium">
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-1.5 text-gray-500" />
                        Course
                      </div>
                    </Label>
                    <Select value={course} onValueChange={setCourse}>
                      <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectItem value="B.Sc">B.Sc</SelectItem>
                        <SelectItem value="B.A">B.A</SelectItem>
                        <SelectItem value="B.Eng">B.Eng</SelectItem>
                        <SelectItem value="B.Com">B.Com</SelectItem>
                        <SelectItem value="BBA">BBA</SelectItem>
                        <SelectItem value="M.Sc">M.Sc</SelectItem>
                        <SelectItem value="M.A">M.A</SelectItem>
                        <SelectItem value="M.Eng">M.Eng</SelectItem>
                        <SelectItem value="MBA">MBA</SelectItem>
                        <SelectItem value="Ph.D">Ph.D</SelectItem>
                        <SelectItem value="Other">Other (specify)</SelectItem>
                      </SelectContent>
                    </Select>
                    {course === "Other" && (
                      <div className="mt-2">
                        <Input
                          placeholder="Enter your degree"
                          value={customCourse}
                          onChange={(e) => setCustomCourse(e.target.value)}
                          className="h-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required={course === "Other"}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400 mb-1.5 block font-medium">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
                        Semester
                      </div>
                    </Label>
                    <Select value={semester} onValueChange={setSemester}>
                      <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectItem value="Semester 1">Semester 1</SelectItem>
                        <SelectItem value="Semester 2">Semester 2</SelectItem>
                        <SelectItem value="Semester 3">Semester 3</SelectItem>
                        <SelectItem value="Semester 4">Semester 4</SelectItem>
                        <SelectItem value="Semester 5">Semester 5</SelectItem>
                        <SelectItem value="Semester 6">Semester 6</SelectItem>
                        <SelectItem value="Semester 7">Semester 7</SelectItem>
                        <SelectItem value="Semester 8">Semester 8</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-400 mb-1.5 block font-medium">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1.5 text-gray-500" />
                      Major Subject
                    </div>
                  </Label>
                  <Input
                    placeholder="Enter your major subject"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="h-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="relative">
                  <Label className="text-sm text-gray-600 dark:text-gray-400 mb-1.5 block font-medium">
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-1.5 text-gray-500" />
                      University
                    </div>
                  </Label>
                  <Input
                    placeholder="Enter your university name"
                    value={university}
                    onChange={(e) => handleUniversityChange(e.target.value)}
                    className="h-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  {showUniversitySuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
                    >
                      <div
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleUniversitySuggestionClick("University of Illinois Chicago")}
                      >
                        University of Illinois Chicago
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    className="mt-1 h-5 w-5 rounded-md border-gray-300 dark:border-gray-600 text-blue-600"
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                    I agree to the processing of my personal data for research purposes and accept the{" "}
                    <Link href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      terms and conditions
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={loading || isUsernameTaken || username.length < 3}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Register</span>
                    </div>
                  )}
                </Button>

                <div className="text-center mt-6 space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      Sign in
                    </Link>
                  </p>

                  <Link
                    href="/admin"
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline inline-block opacity-80 hover:opacity-100 transition-opacity"
                  >
                    Admin Login
                  </Link>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

