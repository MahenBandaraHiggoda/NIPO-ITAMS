"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Settings,
  Shield,
  UserRound,
} from "lucide-react";
import { AppwriteException } from "appwrite";
import { account } from "@/lib/appwrite";

function preferenceText(preferences, keys) {
  for (const key of keys) {
    const value = preferences?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function initialsFor(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  if (words.length === 1)
    return Array.from(words[0]).slice(0, 2).join("").toUpperCase();
  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join("")
    .toUpperCase();
}

function safeAvatarUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function mapAccount(user) {
  const preferences =
    user.prefs && typeof user.prefs === "object" ? user.prefs : {};
  const name =
    preferenceText(preferences, ["fullName"]) || user.name?.trim() || "";

  return {
    name,
    designation: preferenceText(preferences, [
      "designation",
      "jobTitle",
      "position",
      "title",
    ]),
    role: preferenceText(preferences, ["role", "userRole"]),
    avatarUrl: safeAvatarUrl(
      preferenceText(preferences, [
        "avatarUrl",
        "profilePhoto",
        "profileImage",
        "avatar",
      ]),
    ),
    initials: initialsFor(name),
  };
}

function isUnauthenticated(error) {
  return (
    (error instanceof AppwriteException && error.code === 401) ||
    (typeof error?.code === "number" && error.code === 401)
  );
}

function errorText(error) {
  if (isUnauthenticated(error)) return "There is no active account session.";
  if (error instanceof AppwriteException) {
    return "Could not load your account from Appwrite. Please try again.";
  }
  return "Could not load your account. Check your connection and try again.";
}

export default function HeaderUserMenu() {
  const rootRef = useRef(null);
  const [accountState, setAccountState] = useState("loading");
  const [profile, setProfile] = useState(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPage, setMenuPage] = useState("menu");
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setAccountState("loading");
    setLoadError("");

    account
      .get()
      .then((user) => {
        if (!active) return;
        const nextProfile = mapAccount(user);
        setProfile(nextProfile);
        setAvatarLoadFailed(false);
        setAccountState("ready");
      })
      .catch((error) => {
        if (!active) return;
        setProfile(null);
        if (isUnauthenticated(error)) {
          setAccountState("signed-out");
          return;
        }
        setLoadError(errorText(error));
        setAccountState("error");
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setMenuOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setMenuPage("menu");
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((open) => {
      if (!open) {
        setMenuPage("menu");
        setSignOutError("");
      }
      return !open;
    });
  }, []);

  async function signOut() {
    if (accountState !== "ready" || signingOut) return;
    setSigningOut(true);
    setSignOutError("");
    try {
      await account.deleteSession("current");
      setProfile(null);
      setAccountState("signed-out");
      setMenuPage("menu");
    } catch (error) {
      setSignOutError(
        isUnauthenticated(error)
          ? "Your session has already ended."
          : "Could not sign out. Please try again.",
      );
      if (isUnauthenticated(error)) {
        setProfile(null);
        setAccountState("signed-out");
      }
    } finally {
      setSigningOut(false);
    }
  }

  const isReady = accountState === "ready" && profile;
  const buttonLabel = isReady
    ? `Account menu for ${profile.name || "signed-in user"}`
    : accountState === "loading"
      ? "Loading account"
      : accountState === "error"
        ? "Account unavailable"
        : "No active account";

  return (
    <div className="profile-menu-wrap" ref={rootRef}>
      <button
        type="button"
        className="profile-block"
        aria-label={buttonLabel}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        onClick={toggleMenu}
      >
        <span className="profile-avatar">
          {accountState === "loading" ? (
            <LoaderCircle
              className="profile-loading"
              size={16}
              aria-hidden="true"
            />
          ) : isReady && profile.avatarUrl && !avatarLoadFailed ? (
            <Image
              src={profile.avatarUrl}
              alt=""
              width={34}
              height={34}
              unoptimized
              className="profile-photo"
              onError={() => setAvatarLoadFailed(true)}
            />
          ) : (
            <span>
              {isReady
                ? profile.initials
                : accountState === "error"
                  ? "!"
                  : "—"}
            </span>
          )}
        </span>
        <span className="profile-copy">
          <strong>
            {isReady
              ? profile.name || "Unnamed account"
              : accountState === "loading"
                ? "Loading account"
                : accountState === "error"
                  ? "Account unavailable"
                  : "Signed out"}
          </strong>
          <small>
            {isReady
              ? profile.designation || profile.role || "Designation not set"
              : accountState === "loading"
                ? " "
                : accountState === "error"
                  ? "Could not load profile"
                  : "No active session"}
          </small>
        </span>
        <Settings className="profile-settings" size={16} aria-hidden="true" />
        <ChevronDown className="profile-chevron" size={14} aria-hidden="true" />
      </button>

      {menuOpen && (
        <div
          className="profile-popover"
          role="region"
          aria-label="Account menu"
        >
          <div className="profile-popover-heading">
            {isReady ? (
              <>
                <span className="profile-popover-name">
                  {profile.name || "Unnamed account"}
                </span>
                <span className="profile-popover-designation">
                  {profile.designation || "Designation not set"}
                </span>
              </>
            ) : (
              <span className="profile-popover-name">
                {accountState === "loading"
                  ? "Loading account…"
                  : accountState === "error"
                    ? "Account unavailable"
                    : "No active session"}
              </span>
            )}
          </div>

          {accountState === "error" && (
            <div className="profile-menu-error" role="alert">
              <AlertCircle size={15} aria-hidden="true" />
              <span>{loadError}</span>
              <button
                type="button"
                className="profile-retry"
                aria-label="Retry loading account"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                <RefreshCw size={14} aria-hidden="true" />
              </button>
            </div>
          )}

          {menuPage === "menu" ? (
            <>
              <div className="profile-menu-role">
                <Shield size={15} aria-hidden="true" />
                <span>User role</span>
                <strong>
                  {isReady ? profile.role || "Not set" : "Unavailable"}
                </strong>
              </div>
              <div className="profile-menu-options">
                <button
                  type="button"
                  disabled={!isReady}
                  onClick={() => {
                    setMenuPage("profile");
                  }}
                >
                  <UserRound size={15} aria-hidden="true" />
                  My Profile
                </button>
                <button
                  type="button"
                  disabled={!isReady}
                  onClick={() => {
                    setMenuPage("settings");
                  }}
                >
                  <Settings size={15} aria-hidden="true" />
                  Account Settings
                </button>
              </div>
            </>
          ) : (
            <div className="profile-menu-detail">
              <button
                type="button"
                className="profile-back"
                onClick={() => {
                  setMenuPage("menu");
                }}
              >
                <ArrowLeft size={14} aria-hidden="true" />
                Back to account menu
              </button>
              {menuPage === "profile" ? (
                <dl>
                  <div>
                    <dt>Full name</dt>
                    <dd>{profile?.name || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt>Designation</dt>
                    <dd>{profile?.designation || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt>User role</dt>
                    <dd>{profile?.role || "Not set"}</dd>
                  </div>
                </dl>
              ) : (
                <p>
                  Account settings are not configured in this application yet.
                </p>
              )}
            </div>
          )}

          {signOutError && (
            <p className="profile-signout-error" role="alert">
              {signOutError}
            </p>
          )}

          <div className="profile-menu-footer">
            <button
              type="button"
              className="profile-signout"
              disabled={!isReady || signingOut}
              onClick={signOut}
            >
              {signingOut ? (
                <LoaderCircle
                  className="profile-loading"
                  size={15}
                  aria-hidden="true"
                />
              ) : (
                <LogOut size={15} aria-hidden="true" />
              )}
              {signingOut ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
