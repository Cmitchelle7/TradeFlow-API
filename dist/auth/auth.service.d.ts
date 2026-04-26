export declare class AuthService {
    private readonly jwtSecret;
    private readonly jwtExpiration;
    private readonly adminExpiration;
    private readonly adminPassword;
    generateNonce(): string;
    verifyAdminPassword(password: string): Promise<boolean>;
    verifySignature(publicKey: string, signature: string, nonce: string): Promise<boolean>;
    generateJWT(publicKey: string): string;
    generateAdminJWT(): string;
    verifyJWT(token: string): any;
}
