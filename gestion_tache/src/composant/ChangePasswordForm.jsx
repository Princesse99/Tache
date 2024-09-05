import React, { useState } from "react";
import axios from "axios";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const user = useAuthUser();
  const { email } = user;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await axios.put(
        "http://localhost:3000/api/admin/change-password",
        {
          email,
          currentPassword,
          newPassword,
        }
      );

      if (response.data.message) {
        setMessage(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur est survenue");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-24 ml-40">
      <h2 className="text-2xl font-bold text-center mb-4">
        Changer le mot de passe Admin
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div> */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Mot de passe actuel
          </label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Nouveau mot de passe
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-md transition duration-200 ease-in-out"
        >
          Confirmer
        </button>
      </form>
      {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
    </div>
  );
};

export default ChangePasswordForm;
