import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { Keypair } from '@stellar/stellar-sdk';

/**
 * Service handling authentication, JWT generation, and signature verification.
 */
@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
  private readonly jwtExpiration = '1h';
  private readonly adminExpiration = '24h';
  private readonly adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  /**
   * Generates a random cryptographic nonce for secure authentication flows.
   * 
   * @returns A hex-encoded string of 16 random bytes.
   */
  generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Verifies if the provided password matches the configured admin password.
   * 
   * @param password - The password string to verify.
   * @returns A promise that resolves to true if the password is correct.
   */
  async verifyAdminPassword(password: string): Promise<boolean> {
    return password === this.adminPassword;
  }

  /**
   * Verifies a cryptographic signature from a Stellar public key.
   * 
   * @param publicKey - The Stellar public key of the signer.
   * @param signature - The base64-encoded signature.
   * @param nonce - The nonce that was signed.
   * @returns A promise that resolves to true if the signature is valid.
   */
  async verifySignature(publicKey: string, signature: string, nonce: string): Promise<boolean> {
    try {
      const message = `Sign in to TradeFlow with nonce: ${nonce}`;
      const messageBuffer = Buffer.from(message);
      const signatureBuffer = Buffer.from(signature, 'base64');

      // Create a keypair from the public key to verify the signature
      const keypair = Keypair.fromPublicKey(publicKey);
      const isValid = keypair.verify(messageBuffer, signatureBuffer);

      return isValid;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generates a standard JWT for a user authenticated via public key.
   * 
   * @param publicKey - The user's public key to include in the payload.
   * @returns A signed JWT string.
   */
  generateJWT(publicKey: string): string {
    const payload = {
      publicKey,
      sub: publicKey,
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiration,
    });
  }

  /**
   * Generates a privileged JWT for administrative access.
   * 
   * @returns A signed JWT string with admin role.
   */
  generateAdminJWT(): string {
    const payload = {
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.adminExpiration,
    });
  }

  /**
   * Verifies and decodes a JWT token.
   * 
   * @param token - The JWT token to verify.
   * @returns The decoded payload if the token is valid.
   * @throws Error if the token is invalid or expired.
   */
  verifyJWT(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
