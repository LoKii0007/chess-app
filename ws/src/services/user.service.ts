import prisma from "../config/db"

interface userInterface {
    id: string
    fName: string,
    lName: string,
    password: string,
    username: string
}

export const createUser = async (payload: userInterface) => {
    try {
        const user = await prisma.user.create({
            data: {
                ...payload
            }
        })
        console.log('User created successfully:', user)
        return user
    } catch (error) {
        console.error('error creating user', error)
        throw error
    }
}