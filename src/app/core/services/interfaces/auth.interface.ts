export  interface ILogin{
   userNameOrEmail : string
   password : string
}

export interface IRegister{
   fullName : string
   userName : string
   email : string
   phone : string
   password : string
   role : string
   major : string
}
export interface RegisterResponse{
   access_token : string
   refresh_token : string
   expiresIn : number
   expiresAt : number
   user : {
      id : number
      username : string
      email : string
      image : string
      nickname : string
      phone : string
      createdAt : string
      updatedAt : string
   }
}

export interface LoginResponse{
   access_token : string
   refresh_token : string
   expiresIn : number
   expiresAt : number
   user : {
      id : number
      username : string
      email : string
      image : string
      nickname : string
      phone : string
      createdAt : string
      updatedAt : string
   }
}
export interface IrefreshToken{
   token : string
}

export interface RefreshTokenResponse{
   access_token : string
   expiresIn : number
   expiresAt : number
}
export interface ILogout{
   token : string
}
export interface LogoutResponse{
   success : boolean
}

export interface ProfileResponse{
   id : number
   username : string
   email : string
   image : string
   nickname : string
   phone : string
   createdAt : string
   updatedAt : string
}
	
