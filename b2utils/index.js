/**
 * @fileOverview Contains utility functions for interacting with Box2D.
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var box2d_1 = require("../thirdparty/box2d");
var PhysicsLinkedObject_1 = require("./PhysicsLinkedObject");
exports.PhysicsLinkedObject = PhysicsLinkedObject_1.PhysicsLinkedObject;
var b2Utils;
(function (b2Utils) {
    b2Utils.B2_SCALE = 50;
    /**
     * List of all PhysicsLinkedObject that exist.
     * @type {PhysicsLinkedObject[]}
     */
    b2Utils.AllObjects = [];
    /**
     * Temporary vector used for math, to prevent garbage allocation. Use only VERY locally.
     * @type {Box2D.b2Vec2}
     */
    b2Utils.tempVector2 = new box2d_1.Box2D.b2Vec2();
    b2Utils.filter_all = new box2d_1.Box2D.b2FilterData();
    b2Utils.filter_all.maskBits = 0xFFFF;
    b2Utils.filter_all.categoryBits = 0xFFFF;
    b2Utils.filter_none = new box2d_1.Box2D.b2FilterData();
    b2Utils.filter_none.maskBits = 0;
    b2Utils.filter_none.categoryBits = 0;
    b2Utils.staticBodyDef = new box2d_1.Box2D.b2BodyDef();
    b2Utils.dynamicBodyDef = new box2d_1.Box2D.b2BodyDef();
    b2Utils.dynamicBodyDef.type = box2d_1.Box2D.b2Body.b2_dynamicBody;
    b2Utils.kinematicBodyDef = new box2d_1.Box2D.b2BodyDef();
    b2Utils.kinematicBodyDef.type = box2d_1.Box2D.b2Body.b2_kinematicBody;
    var contactFilter;
    var contactListener;
    /**
     * Creates an edge shape.
     * @param {number} x1 First x coordinate in world units.
     * @param {number} y1 First y coordinate in world units.
     * @param {number} x2 Second x coordinate in world units.
     * @param {number} y2 Second y coordinate in world units.
     * @returns {Box2D.b2Shape}
     */
    function createEdgeShape(x1, y1, x2, y2) {
        var shape = new box2d_1.Box2D.b2PolygonShape();
        shape.SetAsEdge(new box2d_1.Box2D.b2Vec2(x1 / b2Utils.B2_SCALE, y1 / b2Utils.B2_SCALE), new box2d_1.Box2D.b2Vec2(x2 / b2Utils.B2_SCALE, y2 / b2Utils.B2_SCALE));
        return shape;
    }
    b2Utils.createEdgeShape = createEdgeShape;
    /**
     * Creates a rectangle shape.
     * @param {number} w The width of the rectangle in world units.
     * @param {number} h The height of the rectangle in world units.
     * @returns {Box2D.b2Shape}
     */
    function createRectShape(w, h) {
        var shape = new box2d_1.Box2D.b2PolygonShape();
        shape.SetAsBox(0.5 * w / b2Utils.B2_SCALE, 0.5 * h / b2Utils.B2_SCALE);
        return shape;
    }
    b2Utils.createRectShape = createRectShape;
    /**
     * Creates a circle shape.
     * @param {number} radius The radius of the circle in world units.
     * @returns {Box2D.b2Shape}
     */
    function createCircleShape(radius) {
        var shape = new box2d_1.Box2D.b2CircleShape();
        shape.SetRadius(radius / b2Utils.B2_SCALE);
        return shape;
    }
    b2Utils.createCircleShape = createCircleShape;
    /**
     * Creates a definition that can be used to add fixtures to bodies.
     * @param {Box2D.b2Shape} shape
     * @param {number} density
     * @param {number} friction
     * @param {number} restitution
     * @returns {Box2D.b2FixtureDef}
     */
    function createFixtureDef(shape, density, friction, restitution) {
        var def = new box2d_1.Box2D.b2FixtureDef();
        def.shape = shape;
        def.density = density;
        def.friction = friction;
        def.restitution = restitution;
        return def;
    }
    b2Utils.createFixtureDef = createFixtureDef;
    /**
     * Creates a static body.
     * @param {Box2D.b2World} world
     * @param {number} x The starting x position of the body in world coordinates.
     * @param {number} y The starting y position of the body in world coordinates.
     * @param {Box2D.b2FixtureDef} fixtureDef (Optional) fixtureDef A fixture to add to the body.
     * @param {Box2D.b2BodyDef} bodyDef (Optional) definition to use for the body
     * @returns {Box2D.b2Body}
     */
    function createStaticBody(world, x, y, fixtureDef, bodyDef) {
        if (!bodyDef)
            bodyDef = b2Utils.staticBodyDef;
        return createBody(world, x, y, fixtureDef, bodyDef);
    }
    b2Utils.createStaticBody = createStaticBody;
    /**
     * Creates a dynamic body.
     * @param {Box2D.b2World} world
     * @param {number} x The starting x position of the body in world coordinates.
     * @param {number} y The starting y position of the body in world coordinates.
     * @param {Box2D.b2FixtureDef} fixtureDef (Optional) A fixture to add to the body.
     * @param {Box2D.b2BodyDef} bodyDef (Optional) definition to use for the body
     * @returns {Box2D.b2Body}
     */
    function createDynamicBody(world, x, y, fixtureDef, bodyDef) {
        if (!bodyDef)
            bodyDef = b2Utils.dynamicBodyDef;
        return createBody(world, x, y, fixtureDef, bodyDef);
    }
    b2Utils.createDynamicBody = createDynamicBody;
    /**
     * Creates a kinematic body.
     * @param {Box2D.b2World} world
     * @param {number} x The starting x position of the body in world coordinates.
     * @param {number} y The starting y position of the body in world coordinates.
     * @param {Box2D.b2FixtureDef} fixtureDef (Optional) A fixture to add to the body.
     * @param {Box2D.b2BodyDef} bodyDef (Optional) definition to use for the body
     * @returns {Box2D.b2Body}
     */
    function createKinematicBody(world, x, y, fixtureDef, bodyDef) {
        if (!bodyDef)
            bodyDef = b2Utils.kinematicBodyDef;
        return createBody(world, x, y, fixtureDef, bodyDef);
    }
    b2Utils.createKinematicBody = createKinematicBody;
    function createBody(world, x, y, fixtureDef, bodyDef) {
        b2Utils.tempVector2.x = x / b2Utils.B2_SCALE;
        b2Utils.tempVector2.y = y / b2Utils.B2_SCALE;
        bodyDef.position = b2Utils.tempVector2;
        var body = world.CreateBody(bodyDef);
        if (fixtureDef) {
            body.CreateFixture(fixtureDef);
        }
        return body;
    }
    var ContactListener = (function (_super) {
        __extends(ContactListener, _super);
        function ContactListener() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ContactListener.prototype.BeginContact = function (contact) {
            var fixtureA = contact.GetFixtureA();
            var fixtureB = contact.GetFixtureB();
            var objectA = fixtureA.GetBody().GetUserData();
            var objectB = fixtureB.GetBody().GetUserData();
            if (objectA)
                objectA.onBeginContact(contact, fixtureB);
            if (objectB)
                objectB.onBeginContact(contact, fixtureA);
        };
        ContactListener.prototype.EndContact = function (contact) {
            var fixtureA = contact.GetFixtureA();
            var fixtureB = contact.GetFixtureB();
            var objectA = fixtureA.GetBody().GetUserData();
            var objectB = fixtureB.GetBody().GetUserData();
            if (objectA)
                objectA.onEndContact(contact, fixtureB);
            if (objectB)
                objectB.onEndContact(contact, fixtureA);
        };
        ContactListener.prototype.PreSolve = function (contact, oldManifold) {
            var fixtureA = contact.GetFixtureA();
            var fixtureB = contact.GetFixtureB();
            var objectA = fixtureA.GetBody().GetUserData();
            var objectB = fixtureB.GetBody().GetUserData();
            if (objectA)
                objectA.onPreSolve(contact, oldManifold, fixtureB);
            if (objectB)
                objectB.onPreSolve(contact, oldManifold, fixtureA);
        };
        ContactListener.prototype.PostSolve = function (contact, impulse) {
            var fixtureA = contact.GetFixtureA();
            var fixtureB = contact.GetFixtureB();
            var objectA = fixtureA.GetBody().GetUserData();
            var objectB = fixtureB.GetBody().GetUserData();
            if (objectA)
                objectA.onPostSolve(contact, impulse, fixtureB);
            if (objectB)
                objectB.onPostSolve(contact, impulse, fixtureA);
        };
        return ContactListener;
    }(box2d_1.Box2D.b2ContactListener));
    b2Utils.ContactListener = ContactListener;
    /**
     * Returns the contact filter for the game.
     * @returns {Box2D.b2ContactFilter}
     */
    function getContactFilter(shouldCollide) {
        if (!contactFilter) {
            contactFilter = new ContactFilter(shouldCollide);
        }
        return contactFilter;
    }
    b2Utils.getContactFilter = getContactFilter;
    var ContactFilter = (function (_super) {
        __extends(ContactFilter, _super);
        function ContactFilter(shouldCollide) {
            var _this = _super.call(this) || this;
            _this.shouldCollide = shouldCollide;
            return _this;
        }
        ContactFilter.prototype.ShouldCollide = function (fixtureA, fixtureB) {
            return this.shouldCollide(fixtureA, fixtureB);
        };
        return ContactFilter;
    }(box2d_1.Box2D.b2ContactFilter));
    b2Utils.ContactFilter = ContactFilter;
    /**
     * If the specified object is involved in the contact, returns the other fixture involved.
     * @param {Box2D.b2Contact} contact
     * @param {PhysicsLinkedObject} linkedObject
     * @returns {Box2D.b2Fixture}
     */
    function getOtherObject(contact, linkedObject) {
        if (contact.GetFixtureA().GetBody() == linkedObject.body) {
            return contact.GetFixtureB();
        }
        else if (contact.GetFixtureB().GetBody() == linkedObject.body) {
            return contact.GetFixtureA();
        }
        else {
            return undefined;
        }
    }
    b2Utils.getOtherObject = getOtherObject;
})(b2Utils = exports.b2Utils || (exports.b2Utils = {}));
