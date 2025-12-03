const express = require("express");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const { db } = require("../db");

const router = express.Router();

router.post("/", async (req, res) => {
    await db.read();

    const password = "test1234";
    const passwordHash = await bcrypt.hash(password, 8);

    const alice = {
        id: nanoid(),
        name: "Alice",
        email: "alice@example.com",
        passwordHash,
        role: "user",
        bio: "I teach JavaScript",
        avatar: "",
        skills: [],
    };
    const bob = {
        id: nanoid(),
        name: "Bob",
        email: "bob@example.com",
        passwordHash,
        role: "mentor",
        bio: "I teach Math",
        avatar: "",
        skills: [],
    };

    db.data.users = [alice, bob];

    const skill1 = {
        id: nanoid(),
        title: "JavaScript",
        description: "Web frontend",
        category: "skill",
        proficiency: "advanced",
        tags: ["programming", "frontend"],
        ownerId: alice.id,
    };
    const skill2 = {
        id: nanoid(),
        title: "Algebra",
        description: "College math",
        category: "academic",
        proficiency: "intermediate",
        tags: ["math"],
        ownerId: bob.id,
    };

    db.data.skills = [skill1, skill2];
    alice.skills.push(skill1.id);
    bob.skills.push(skill2.id);

    const course = {
        id: nanoid(),
        mentorId: bob.id,
        title: "Algebra Basics",
        description: "Start from the beginning",
        price: 19,
        modules: [],
        status: "published",
        createdAt: new Date().toISOString(),
    };
    db.data.courses = [course];

    db.data.swaps = [];
    db.data.chats = [];
    db.data.enrollments = [];
    db.data.meetings = [];

    await db.write();
    res.json({
        ok: true,
        users: db.data.users,
        skills: db.data.skills,
        courses: db.data.courses,
    });
});

module.exports = router;
