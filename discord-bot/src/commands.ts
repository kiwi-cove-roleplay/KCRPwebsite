import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

// Mirrors sfos-core/shared/constants.lua's fixed V1 permission catalog.
// Kept as fixed choices (not free text) to avoid typo'd permission strings
// granted from Discord ever reaching the database. Fictional agency names
// (Southern Frontier is this platform's own in-universe region), matching
// database/migrations/0003_agencies.sql's seed.
const PERMISSION_CHOICES = [
  { name: "Aotearoa Police", value: "sfos.role.police" },
  { name: "Aotearoa Fire & Rescue", value: "sfos.role.fire" },
  { name: "Aotearoa Ambulance", value: "sfos.role.stjohn" },
  { name: "Aotearoa Corrections", value: "sfos.role.corrections" },
  { name: "Aotearoa Emergency Management", value: "sfos.role.civildefence" },
  { name: "Staff: Agency HR (hire/fire/promote)", value: "sfos.staff.hr" },
  { name: "Staff: Vehicles (givevehicle)", value: "sfos.staff.vehicles" },
  { name: "Staff: AOP / Priority (/aop, /priority staff actions)", value: "sfos.staff.aop" },
  { name: "Staff: Admin Menu (permissions, AOP, player actions, catalogs)", value: "sfos.staff.admin" },
];

export const commands = [
  new SlashCommandBuilder()
    .setName("grant-permission")
    .setDescription("Grant a Southern Frontier role permission to a linked player")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption((option) => option.setName("player").setDescription("The Discord user").setRequired(true))
    .addStringOption((option) =>
      option
        .setName("permission")
        .setDescription("Permission to grant")
        .setRequired(true)
        .addChoices(...PERMISSION_CHOICES),
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("revoke-permission")
    .setDescription("Revoke a Southern Frontier role permission from a linked player")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption((option) => option.setName("player").setDescription("The Discord user").setRequired(true))
    .addStringOption((option) =>
      option
        .setName("permission")
        .setDescription("Permission to revoke")
        .setRequired(true)
        .addChoices(...PERMISSION_CHOICES),
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("lookup-player")
    .setDescription("Show a linked player's account, characters, and permissions")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption((option) => option.setName("player").setDescription("The Discord user").setRequired(true))
    .toJSON(),
];
