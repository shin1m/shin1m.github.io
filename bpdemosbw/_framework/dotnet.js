//! Licensed to the .NET Foundation under one or more agreements.
//! The .NET Foundation licenses this file to you under the MIT license.

var __dotnet_runtime = (function (exports) {
    'use strict';

    // Licensed to the .NET Foundation under one or more agreements.
    // The .NET Foundation licenses this file to you under the MIT license.
    // these are our public API (except internal)
    let Module;
    let MONO$1;
    let BINDING$1;
    let INTERNAL$1;
    // these are imported and re-exported from emscripten internals
    let ENVIRONMENT_IS_GLOBAL;
    let ENVIRONMENT_IS_NODE;
    let ENVIRONMENT_IS_SHELL;
    let ENVIRONMENT_IS_WEB;
    let locateFile;
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function setImportsAndExports(imports, exports) {
        MONO$1 = exports.mono;
        BINDING$1 = exports.binding;
        INTERNAL$1 = exports.internal;
        Module = exports.module;
        ENVIRONMENT_IS_GLOBAL = imports.isGlobal;
        ENVIRONMENT_IS_NODE = imports.isNode;
        ENVIRONMENT_IS_SHELL = imports.isShell;
        ENVIRONMENT_IS_WEB = imports.isWeb;
        locateFile = imports.locateFile;
    }
    let monoConfig;
    let runtime_is_ready = false;
    const runtimeHelpers = {
        namespace: "System.Runtime.InteropServices.JavaScript",
        classname: "Runtime",
        get mono_wasm_runtime_is_ready() {
            return runtime_is_ready;
        },
        set mono_wasm_runtime_is_ready(value) {
            runtime_is_ready = value;
            INTERNAL$1.mono_wasm_runtime_is_ready = value;
        },
        get config() {
            return monoConfig;
        },
        set config(value) {
            monoConfig = value;
            MONO$1.config = value;
            Module.config = value;
        },
    };

    // Licensed to the .NET Foundation under one or more agreements.
    const fn_signatures$1 = [
        // MONO
        ["il2cxx_wasm_slot_set", null, ["number", "number"]],
        ["mono_wasm_string_get_data", null, ["number", "number", "number", "number"]],
        ["mono_wasm_set_is_debugger_attached", "void", ["bool"]],
        ["mono_wasm_send_dbg_command", "bool", ["number", "number", "number", "number", "number"]],
        ["mono_wasm_send_dbg_command_with_parms", "bool", ["number", "number", "number", "number", "number", "number", "string"]],
        ["mono_wasm_setenv", null, ["string", "string"]],
        ["mono_wasm_parse_runtime_options", null, ["number", "number"]],
        ["mono_wasm_strdup", "number", ["string"]],
        ["mono_background_exec", null, []],
        ["mono_set_timeout_exec", null, ["number"]],
        ["mono_wasm_load_icu_data", "number", ["number"]],
        ["mono_wasm_get_icudt_name", "string", ["string"]],
        ["mono_wasm_add_assembly", "number", ["string", "number", "number"]],
        ["mono_wasm_add_satellite_assembly", "void", ["string", "string", "number", "number"]],
        ["mono_wasm_load_runtime", null, ["string", "number"]],
        ["mono_wasm_exit", null, ["number"]],
        // BINDING
        ["mono_wasm_get_corlib", "number", []],
        ["mono_wasm_assembly_load", "number", ["string"]],
        ["mono_wasm_find_corlib_class", "number", ["string", "string"]],
        ["mono_wasm_assembly_find_class", "number", ["number", "string", "string"]],
        ["mono_wasm_find_corlib_type", "number", ["string", "string"]],
        ["mono_wasm_assembly_find_type", "number", ["number", "string", "string"]],
        ["mono_wasm_assembly_find_method", "number", ["number", "string", "number"]],
        ["mono_wasm_invoke_method", "number", ["number", "number", "number", "number"]],
        ["mono_wasm_string_get_utf8", "number", ["number"]],
        ["mono_wasm_string_from_utf16", "number", ["number", "number"]],
        ["mono_wasm_get_obj_type", "number", ["number"]],
        ["mono_wasm_array_length", "number", ["number"]],
        ["mono_wasm_array_get", "number", ["number", "number"]],
        ["mono_wasm_obj_array_new", "number", ["number"]],
        ["mono_wasm_obj_array_set", "void", ["number", "number", "number"]],
        ["mono_wasm_register_bundled_satellite_assemblies", "void", []],
        ["mono_wasm_try_unbox_primitive_and_get_type", "number", ["number", "number", "number"]],
        ["mono_wasm_box_primitive", "number", ["number", "number", "number"]],
        ["mono_wasm_intern_string", "number", ["number"]],
        ["mono_wasm_assembly_get_entry_point", "number", ["number"]],
        ["mono_wasm_get_delegate_invoke", "number", ["number"]],
        ["mono_wasm_string_array_new", "number", ["number"]],
        ["mono_wasm_typed_array_new", "number", ["number", "number", "number", "number"]],
        ["mono_wasm_class_get_type", "number", ["number"]],
        ["mono_wasm_type_get_class", "number", ["number"]],
        ["mono_wasm_get_type_name", "string", ["number"]],
        ["mono_wasm_get_type_aqn", "string", ["number"]],
        ["mono_wasm_unbox_rooted", "number", ["number"]],
        //DOTNET
        ["mono_wasm_string_from_js", "number", ["string"]],
        //INTERNAL
        ["mono_wasm_exit", "void", ["number"]],
        ["mono_wasm_set_main_args", "void", ["number", "number"]],
        ["mono_wasm_enable_on_demand_gc", "void", ["number"]],
        ["mono_profiler_init_aot", "void", ["number"]],
        ["mono_wasm_exec_regression", "number", ["number", "string"]],
    ];
    const wrapped_c_functions = {};
    for (const sig of fn_signatures$1) {
        const wf = wrapped_c_functions;
        // lazy init on first run
        wf[sig[0]] = function (...args) {
            const fce = Module.cwrap(sig[0], sig[1], sig[2], sig[3]);
            wf[sig[0]] = fce;
            return fce(...args);
        };
    }

    // Licensed to the .NET Foundation under one or more agreements.
    const maxScratchRoots = 8192;
    let _scratch_root_buffer = null;
    let _scratch_root_free_indices = null;
    let _scratch_root_free_indices_count = 0;
    const _scratch_root_free_instances = [];
    /**
     * Allocates a block of memory that can safely contain pointers into the managed heap.
     * The result object has get(index) and set(index, value) methods that can be used to retrieve and store managed pointers.
     * Once you are done using the root buffer, you must call its release() method.
     * For small numbers of roots, it is preferable to use the mono_wasm_new_root and mono_wasm_new_roots APIs instead.
     */
    function mono_wasm_new_root_buffer(capacity, name) {
        if (capacity <= 0)
            throw new Error("capacity >= 1");
        capacity = capacity | 0;
        const capacityBytes = capacity * 4;
        const offset = Module._malloc(capacityBytes);
        if ((offset % 4) !== 0)
            throw new Error("Malloc returned an unaligned offset");
        _zero_region(offset, capacityBytes);
        return new WasmRootBuffer(offset, capacity, true, name);
    }
    /**
     * Creates a root buffer object representing an existing allocation in the native heap and registers
     *  the allocation with the GC. The caller is responsible for managing the lifetime of the allocation.
     */
    function mono_wasm_new_root_buffer_from_pointer(offset, capacity, name) {
        if (capacity <= 0)
            throw new Error("capacity >= 1");
        capacity = capacity | 0;
        const capacityBytes = capacity * 4;
        if ((offset % 4) !== 0)
            throw new Error("Unaligned offset");
        _zero_region(offset, capacityBytes);
        return new WasmRootBuffer(offset, capacity, false, name);
    }
    /**
     * Allocates temporary storage for a pointer into the managed heap.
     * Pointers stored here will be visible to the GC, ensuring that the object they point to aren't moved or collected.
     * If you already have a managed pointer you can pass it as an argument to initialize the temporary storage.
     * The result object has get() and set(value) methods, along with a .value property.
     * When you are done using the root you must call its .release() method.
     */
    function mono_wasm_new_root(value = undefined) {
        let result;
        if (_scratch_root_free_instances.length > 0) {
            result = _scratch_root_free_instances.pop();
        }
        else {
            const index = _mono_wasm_claim_scratch_index();
            const buffer = _scratch_root_buffer;
            result = new WasmRoot(buffer, index);
        }
        if (value !== undefined) {
            if (typeof (value) !== "number")
                throw new Error("value must be an address in the managed heap");
            result.set(value);
        }
        else {
            result.set(0);
        }
        return result;
    }
    /**
     * Allocates 1 or more temporary roots, accepting either a number of roots or an array of pointers.
     * mono_wasm_new_roots(n): returns an array of N zero-initialized roots.
     * mono_wasm_new_roots([a, b, ...]) returns an array of new roots initialized with each element.
     * Each root must be released with its release method, or using the mono_wasm_release_roots API.
     */
    function mono_wasm_new_roots(count_or_values) {
        let result;
        if (Array.isArray(count_or_values)) {
            result = new Array(count_or_values.length);
            for (let i = 0; i < result.length; i++)
                result[i] = mono_wasm_new_root(count_or_values[i]);
        }
        else if ((count_or_values | 0) > 0) {
            result = new Array(count_or_values);
            for (let i = 0; i < result.length; i++)
                result[i] = mono_wasm_new_root();
        }
        else {
            throw new Error("count_or_values must be either an array or a number greater than 0");
        }
        return result;
    }
    /**
     * Releases 1 or more root or root buffer objects.
     * Multiple objects may be passed on the argument list.
     * 'undefined' may be passed as an argument so it is safe to call this method from finally blocks
     *  even if you are not sure all of your roots have been created yet.
     * @param {... WasmRoot} roots
     */
    function mono_wasm_release_roots(...args) {
        for (let i = 0; i < args.length; i++) {
            if (!args[i])
                continue;
            args[i].release();
        }
    }
    function _zero_region(byteOffset, sizeBytes) {
        sizeBytes += byteOffset;
        if (((byteOffset % 4) === 0) && ((sizeBytes % 4) === 0))
            Module.HEAP32.fill(0, byteOffset >>> 2, sizeBytes >>> 2);
        else
            Module.HEAP8.fill(0, byteOffset, sizeBytes);
    }
    function _mono_wasm_release_scratch_index(index) {
        if (index === undefined)
            return;
        _scratch_root_buffer.set(index, 0);
        _scratch_root_free_indices[_scratch_root_free_indices_count] = index;
        _scratch_root_free_indices_count++;
    }
    function _mono_wasm_claim_scratch_index() {
        if (!_scratch_root_buffer || !_scratch_root_free_indices) {
            _scratch_root_buffer = mono_wasm_new_root_buffer(maxScratchRoots, "js roots");
            _scratch_root_free_indices = new Int32Array(maxScratchRoots);
            _scratch_root_free_indices_count = maxScratchRoots;
            for (let i = 0; i < maxScratchRoots; i++)
                _scratch_root_free_indices[i] = maxScratchRoots - i - 1;
        }
        if (_scratch_root_free_indices_count < 1)
            throw new Error("Out of scratch root space");
        const result = _scratch_root_free_indices[_scratch_root_free_indices_count - 1];
        _scratch_root_free_indices_count--;
        return result;
    }
    class WasmRootBuffer {
        constructor(offset, capacity, ownsAllocation, name) {
            const capacityBytes = capacity * 4;
            this.__offset = offset;
            this.__offset32 = offset >>> 2;
            this.__count = capacity;
            this.length = capacity;
            this.__ownsAllocation = ownsAllocation;
        }
        _throw_index_out_of_range() {
            throw new Error("index out of range");
        }
        _check_in_range(index) {
            if ((index >= this.__count) || (index < 0))
                this._throw_index_out_of_range();
        }
        get_address(index) {
            this._check_in_range(index);
            return this.__offset + (index * 4);
        }
        get_address_32(index) {
            this._check_in_range(index);
            return this.__offset32 + index;
        }
        // NOTE: These functions do not use the helpers from memory.ts because WasmRoot.get and WasmRoot.set
        //  are hot-spots when you profile any application that uses the bindings extensively.
        get(index) {
            this._check_in_range(index);
            return this._unsafe_get(index);
        }
        set(index, value) {
            this._check_in_range(index);
            this._unsafe_set(index, value);
            return value;
        }
        _unsafe_get(index) {
            return Module.HEAP32[this.__offset32 + index];
        }
        _unsafe_set(index, value) {
            wrapped_c_functions.il2cxx_wasm_slot_set(this.__offset + (index * 4), value);
        }
        clear() {
            if (!this.__offset)
                return;
            const q = this.__offset + this.__count * 4;
            for (let p = this.__offset; p < q; p += 4)
                wrapped_c_functions.il2cxx_wasm_slot_set(p, 0);
        }
        release() {
            this.clear();
            if (this.__offset && this.__ownsAllocation)
                Module._free(this.__offset);
        }
        toString() {
            return `[root buffer @${this.get_address(0)}, size ${this.__count} ]`;
        }
    }
    class WasmRoot {
        constructor(buffer, index) {
            this.__buffer = buffer; //TODO
            this.__index = index;
        }
        get_address() {
            return this.__buffer.get_address(this.__index);
        }
        get_address_32() {
            return this.__buffer.get_address_32(this.__index);
        }
        get() {
            const result = this.__buffer._unsafe_get(this.__index);
            return result;
        }
        set(value) {
            this.__buffer._unsafe_set(this.__index, value);
            return value;
        }
        get value() {
            return this.get();
        }
        set value(value) {
            this.set(value);
        }
        valueOf() {
            return this.get();
        }
        clear() {
            this.set(0);
        }
        release() {
            if (!this.__buffer)
                throw new Error("No buffer");
            const maxPooledInstances = 128;
            if (_scratch_root_free_instances.length > maxPooledInstances) {
                _mono_wasm_release_scratch_index(this.__index);
                this.__buffer = null;
                this.__index = 0;
            }
            else {
                this.set(0);
                _scratch_root_free_instances.push(this);
            }
        }
        toString() {
            return `[root @${this.get_address()}]`;
        }
    }

    // Licensed to the .NET Foundation under one or more agreements.
    // The .NET Foundation licenses this file to you under the MIT license.
    // Code from JSIL:
    // https://github.com/sq/JSIL/blob/1d57d5427c87ab92ffa3ca4b82429cd7509796ba/JSIL.Libraries/Includes/Bootstrap/Core/Classes/System.Convert.js#L149
    // Thanks to Katelyn Gadd @kg
    function toBase64StringImpl(inArray, offset, length) {
        const reader = _makeByteReader(inArray, offset, length);
        let result = "";
        let ch1 = 0, ch2 = 0, ch3 = 0;
        let bits = 0, equalsCount = 0, sum = 0;
        const mask1 = (1 << 24) - 1, mask2 = (1 << 18) - 1, mask3 = (1 << 12) - 1, mask4 = (1 << 6) - 1;
        const shift1 = 18, shift2 = 12, shift3 = 6, shift4 = 0;
        for (;;) {
            ch1 = reader.read();
            ch2 = reader.read();
            ch3 = reader.read();
            if (ch1 === null)
                break;
            if (ch2 === null) {
                ch2 = 0;
                equalsCount += 1;
            }
            if (ch3 === null) {
                ch3 = 0;
                equalsCount += 1;
            }
            // Seems backwards, but is right!
            sum = (ch1 << 16) | (ch2 << 8) | (ch3 << 0);
            bits = (sum & mask1) >> shift1;
            result += _base64Table[bits];
            bits = (sum & mask2) >> shift2;
            result += _base64Table[bits];
            if (equalsCount < 2) {
                bits = (sum & mask3) >> shift3;
                result += _base64Table[bits];
            }
            if (equalsCount === 2) {
                result += "==";
            }
            else if (equalsCount === 1) {
                result += "=";
            }
            else {
                bits = (sum & mask4) >> shift4;
                result += _base64Table[bits];
            }
        }
        return result;
    }
    const _base64Table = [
        "A", "B", "C", "D",
        "E", "F", "G", "H",
        "I", "J", "K", "L",
        "M", "N", "O", "P",
        "Q", "R", "S", "T",
        "U", "V", "W", "X",
        "Y", "Z",
        "a", "b", "c", "d",
        "e", "f", "g", "h",
        "i", "j", "k", "l",
        "m", "n", "o", "p",
        "q", "r", "s", "t",
        "u", "v", "w", "x",
        "y", "z",
        "0", "1", "2", "3",
        "4", "5", "6", "7",
        "8", "9",
        "+", "/"
    ];
    function _makeByteReader(bytes, index, count) {
        let position = (typeof (index) === "number") ? index : 0;
        let endpoint;
        if (typeof (count) === "number")
            endpoint = (position + count);
        else
            endpoint = (bytes.length - position);
        const result = {
            read: function () {
                if (position >= endpoint)
                    return null;
                const nextByte = bytes[position];
                position += 1;
                return nextByte;
            }
        };
        Object.defineProperty(result, "eof", {
            get: function () {
                return (position >= endpoint);
            },
            configurable: true,
            enumerable: true
        });
        return result;
    }

    // Licensed to the .NET Foundation under one or more agreements.
    let commands_received;
    let _call_function_res_cache = {};
    let _next_call_function_res_id = 0;
    let _debugger_buffer_len = -1;
    let _debugger_buffer;
    function mono_wasm_runtime_ready() {
        runtimeHelpers.mono_wasm_runtime_is_ready = true;
        // FIXME: where should this go?
        _next_call_function_res_id = 0;
        _call_function_res_cache = {};
        _debugger_buffer_len = -1;
        // DO NOT REMOVE - magic debugger init function
        if (globalThis.dotnetDebugger)
            // eslint-disable-next-line no-debugger
            debugger;
        else
            console.debug("mono_wasm_runtime_ready", "fe00e07a-5519-4dfe-b35a-f867dbaf2e28");
    }
    function mono_wasm_fire_debugger_agent_message() {
        // eslint-disable-next-line no-debugger
        debugger;
    }
    function mono_wasm_add_dbg_command_received(res_ok, id, buffer, buffer_len) {
        const assembly_data = new Uint8Array(Module.HEAPU8.buffer, buffer, buffer_len);
        const base64String = toBase64StringImpl(assembly_data);
        const buffer_obj = {
            res_ok,
            res: {
                id,
                value: base64String
            }
        };
        commands_received = buffer_obj;
    }
    function mono_wasm_malloc_and_set_debug_buffer(command_parameters) {
        if (command_parameters.length > _debugger_buffer_len) {
            if (_debugger_buffer)
                Module._free(_debugger_buffer);
            _debugger_buffer_len = Math.max(command_parameters.length, _debugger_buffer_len, 256);
            _debugger_buffer = Module._malloc(_debugger_buffer_len);
        }
        const byteCharacters = atob(command_parameters);
        for (let i = 0; i < byteCharacters.length; i++) {
            Module.HEAPU8[_debugger_buffer + i] = byteCharacters.charCodeAt(i);
        }
    }
    function mono_wasm_send_dbg_command_with_parms(id, command_set, command, command_parameters, length, valtype, newvalue) {
        mono_wasm_malloc_and_set_debug_buffer(command_parameters);
        wrapped_c_functions.mono_wasm_send_dbg_command_with_parms(id, command_set, command, _debugger_buffer, length, valtype, newvalue.toString());
        const { res_ok, res } = commands_received;
        if (!res_ok)
            throw new Error("Failed on mono_wasm_invoke_method_debugger_agent_with_parms");
        return res;
    }
    function mono_wasm_send_dbg_command(id, command_set, command, command_parameters) {
        mono_wasm_malloc_and_set_debug_buffer(command_parameters);
        wrapped_c_functions.mono_wasm_send_dbg_command(id, command_set, command, _debugger_buffer, command_parameters.length);
        const { res_ok, res } = commands_received;
        if (!res_ok)
            throw new Error("Failed on mono_wasm_send_dbg_command");
        return res;
    }
    function mono_wasm_get_dbg_command_info() {
        const { res_ok, res } = commands_received;
        if (!res_ok)
            throw new Error("Failed on mono_wasm_get_dbg_command_info");
        return res;
    }
    function mono_wasm_debugger_resume() {
        //nothing
    }
    function mono_wasm_detach_debugger() {
        wrapped_c_functions.mono_wasm_set_is_debugger_attached(false);
    }
    /**
     * Raises an event for the debug proxy
     */
    function mono_wasm_raise_debug_event(event, args = {}) {
        if (typeof event !== "object")
            throw new Error(`event must be an object, but got ${JSON.stringify(event)}`);
        if (event.eventName === undefined)
            throw new Error(`event.eventName is a required parameter, in event: ${JSON.stringify(event)}`);
        if (typeof args !== "object")
            throw new Error(`args must be an object, but got ${JSON.stringify(args)}`);
        console.debug("mono_wasm_debug_event_raised:aef14bca-5519-4dfe-b35a-f867abc123ae", JSON.stringify(event), JSON.stringify(args));
    }
    // Used by the debugger to enumerate loaded dlls and pdbs
    function mono_wasm_get_loaded_files() {
        wrapped_c_functions.mono_wasm_set_is_debugger_attached(true);
        return MONO$1.loaded_files;
    }
    function _create_proxy_from_object_id(objectId, details) {
        if (objectId.startsWith("dotnet:array:")) {
            let ret;
            if (details.dimensionsDetails == undefined || details.dimensionsDetails.length == 1) {
                ret = details.items.map((p) => p.value);
                return ret;
            }
        }
        const proxy = {};
        Object.keys(details).forEach(p => {
            const prop = details[p];
            if (prop.get !== undefined) {
                Object.defineProperty(proxy, prop.name, {
                    get() {
                        return mono_wasm_send_dbg_command(-1, prop.get.commandSet, prop.get.command, prop.get.buffer);
                    },
                    set: function (newValue) {
                        mono_wasm_send_dbg_command_with_parms(-1, prop.set.commandSet, prop.set.command, prop.set.buffer, prop.set.length, prop.set.valtype, newValue);
                        return commands_received.res_ok;
                    }
                });
            }
            else if (prop.set !== undefined) {
                Object.defineProperty(proxy, prop.name, {
                    get() {
                        return prop.value;
                    },
                    set: function (newValue) {
                        mono_wasm_send_dbg_command_with_parms(-1, prop.set.commandSet, prop.set.command, prop.set.buffer, prop.set.length, prop.set.valtype, newValue);
                        return commands_received.res_ok;
                    }
                });
            }
            else {
                proxy[prop.name] = prop.value;
            }
        });
        return proxy;
    }
    function mono_wasm_call_function_on(request) {
        if (request.arguments != undefined && !Array.isArray(request.arguments))
            throw new Error(`"arguments" should be an array, but was ${request.arguments}`);
        const objId = request.objectId;
        const details = request.details;
        let proxy = {};
        if (objId.startsWith("dotnet:cfo_res:")) {
            if (objId in _call_function_res_cache)
                proxy = _call_function_res_cache[objId];
            else
                throw new Error(`Unknown object id ${objId}`);
        }
        else {
            proxy = _create_proxy_from_object_id(objId, details);
        }
        const fn_args = request.arguments != undefined ? request.arguments.map(a => JSON.stringify(a.value)) : [];
        const fn_body_template = `var fn = ${request.functionDeclaration}; return fn.apply(proxy, [${fn_args}]);`;
        const fn_defn = new Function("proxy", fn_body_template);
        const fn_res = fn_defn(proxy);
        if (fn_res === undefined)
            return { type: "undefined" };
        if (Object(fn_res) !== fn_res) {
            if (typeof (fn_res) == "object" && fn_res == null)
                return { type: typeof (fn_res), subtype: `${fn_res}`, value: null };
            return { type: typeof (fn_res), description: `${fn_res}`, value: `${fn_res}` };
        }
        if (request.returnByValue && fn_res.subtype == undefined)
            return { type: "object", value: fn_res };
        if (Object.getPrototypeOf(fn_res) == Array.prototype) {
            const fn_res_id = _cache_call_function_res(fn_res);
            return {
                type: "object",
                subtype: "array",
                className: "Array",
                description: `Array(${fn_res.length})`,
                objectId: fn_res_id
            };
        }
        if (fn_res.value !== undefined || fn_res.subtype !== undefined) {
            return fn_res;
        }
        if (fn_res == proxy)
            return { type: "object", className: "Object", description: "Object", objectId: objId };
        const fn_res_id = _cache_call_function_res(fn_res);
        return { type: "object", className: "Object", description: "Object", objectId: fn_res_id };
    }
    function _get_cfo_res_details(objectId, args) {
        if (!(objectId in _call_function_res_cache))
            throw new Error(`Could not find any object with id ${objectId}`);
        const real_obj = _call_function_res_cache[objectId];
        const descriptors = Object.getOwnPropertyDescriptors(real_obj);
        if (args.accessorPropertiesOnly) {
            Object.keys(descriptors).forEach(k => {
                if (descriptors[k].get === undefined)
                    Reflect.deleteProperty(descriptors, k);
            });
        }
        const res_details = [];
        Object.keys(descriptors).forEach(k => {
            let new_obj;
            const prop_desc = descriptors[k];
            if (typeof prop_desc.value == "object") {
                // convert `{value: { type='object', ... }}`
                // to      `{ name: 'foo', value: { type='object', ... }}
                new_obj = Object.assign({ name: k }, prop_desc);
            }
            else if (prop_desc.value !== undefined) {
                // This is needed for values that were not added by us,
                // thus are like { value: 5 }
                // instead of    { value: { type = 'number', value: 5 }}
                //
                // This can happen, for eg., when `length` gets added for arrays
                // or `__proto__`.
                new_obj = {
                    name: k,
                    // merge/add `type` and `description` to `d.value`
                    value: Object.assign({ type: (typeof prop_desc.value), description: "" + prop_desc.value }, prop_desc)
                };
            }
            else if (prop_desc.get !== undefined) {
                // The real_obj has the actual getter. We are just returning a placeholder
                // If the caller tries to run function on the cfo_res object,
                // that accesses this property, then it would be run on `real_obj`,
                // which *has* the original getter
                new_obj = {
                    name: k,
                    get: {
                        className: "Function",
                        description: `get ${k} () {}`,
                        type: "function"
                    }
                };
            }
            else {
                new_obj = { name: k, value: { type: "symbol", value: "<Unknown>", description: "<Unknown>" } };
            }
            res_details.push(new_obj);
        });
        return { __value_as_json_string__: JSON.stringify(res_details) };
    }
    function mono_wasm_get_details(objectId, args = {}) {
        return _get_cfo_res_details(`dotnet:cfo_res:${objectId}`, args);
    }
    function _cache_call_function_res(obj) {
        const id = `dotnet:cfo_res:${_next_call_function_res_id++}`;
        _call_function_res_cache[id] = obj;
        return id;
    }
    function mono_wasm_release_object(objectId) {
        if (objectId in _call_function_res_cache)
            delete _call_function_res_cache[objectId];
    }

    // Licensed to the .NET Foundation under one or more agreements.
    // The .NET Foundation licenses this file to you under the MIT license.
    const MonoMethodNull = 0;
    const MonoObjectNull = 0;
    const MonoArrayNull = 0;
    const MonoAssemblyNull = 0;
    const MonoClassNull = 0;
    const MonoTypeNull = 0;
    const MonoStringNull = 0;
    const JSHandleDisposed = -1;
    const JSHandleNull = 0;
    const VoidPtrNull = 0;
    const CharPtrNull = 0;
    function coerceNull(ptr) {
        return (ptr | 0);
    }
    const wasm_type_symbol = Symbol.for("wasm type");

    // Licensed to the .NET Foundation under one or more agreements.
    let num_icu_assets_loaded_successfully = 0;
    // @offset must be the address of an ICU data archive in the native heap.
    // returns true on success.
    function mono_wasm_load_icu_data(offset) {
        const ok = (wrapped_c_functions.mono_wasm_load_icu_data(offset)) === 1;
        if (ok)
            num_icu_assets_loaded_successfully++;
        return ok;
    }
    // Get icudt.dat exact filename that matches given culture, examples:
    //   "ja" -> "icudt_CJK.dat"
    //   "en_US" (or "en-US" or just "en") -> "icudt_EFIGS.dat"
    // etc, see "mono_wasm_get_icudt_name" implementation in pal_icushim_static.c
    function mono_wasm_get_icudt_name(culture) {
        return wrapped_c_functions.mono_wasm_get_icudt_name(culture);
    }
    // Performs setup for globalization.
    // @globalization_mode is one of "icu", "invariant", or "auto".
    // "auto" will use "icu" if any ICU data archives have been loaded,
    //  otherwise "invariant".
    function mono_wasm_globalization_init(globalization_mode) {
        let invariantMode = false;
        if (globalization_mode === "invariant")
            invariantMode = true;
        if (!invariantMode) {
            if (num_icu_assets_loaded_successfully > 0) {
                console.debug("MONO_WASM: ICU data archive(s) loaded, disabling invariant mode");
            }
            else if (globalization_mode !== "icu") {
                console.debug("MONO_WASM: ICU data archive(s) not loaded, using invariant globalization mode");
                invariantMode = true;
            }
            else {
                const msg = "invariant globalization mode is inactive and no ICU data archives were loaded";
                console.error(`MONO_WASM: ERROR: ${msg}`);
                throw new Error(msg);
            }
        }
        if (invariantMode)
            wrapped_c_functions.mono_wasm_setenv("DOTNET_SYSTEM_GLOBALIZATION_INVARIANT", "1");
        // Set globalization mode to PredefinedCulturesOnly
        wrapped_c_functions.mono_wasm_setenv("DOTNET_SYSTEM_GLOBALIZATION_PREDEFINED_CULTURES_ONLY", "1");
    }

    // Licensed to the .NET Foundation under one or more agreements.
    // Initialize the AOT profiler with OPTIONS.
    // Requires the AOT profiler to be linked into the app.
    // options = { write_at: "<METHODNAME>", send_to: "<METHODNAME>" }
    // <METHODNAME> should be in the format <CLASS>::<METHODNAME>.
    // write_at defaults to 'WebAssembly.Runtime::StopProfile'.
    // send_to defaults to 'WebAssembly.Runtime::DumpAotProfileData'.
    // DumpAotProfileData stores the data into INTERNAL.aot_profile_data.
    //
    function mono_wasm_init_aot_profiler(options) {
        if (options == null)
            options = {};
        if (!("write_at" in options))
            options.write_at = "Interop/Runtime::StopProfile";
        if (!("send_to" in options))
            options.send_to = "Interop/Runtime::DumpAotProfileData";
        const arg = "aot:write-at-method=" + options.write_at + ",send-to-method=" + options.send_to;
        Module.ccall("mono_wasm_load_profiler_aot", null, ["string"], [arg]);
    }
    // options = { write_at: "<METHODNAME>", send_to: "<METHODNAME>" }
    // <METHODNAME> should be in the format <CLASS>::<METHODNAME>.
    // write_at defaults to 'WebAssembly.Runtime::StopProfile'.
    // send_to defaults to 'WebAssembly.Runtime::DumpCoverageProfileData'.
    // DumpCoverageProfileData stores the data into INTERNAL.coverage_profile_data.
    function mono_wasm_init_coverage_profiler(options) {
        if (options == null)
            options = {};
        if (!("write_at" in options))
            options.write_at = "WebAssembly.Runtime::StopProfile";
        if (!("send_to" in options))
            options.send_to = "WebAssembly.Runtime::DumpCoverageProfileData";
        const arg = "coverage:write-at-method=" + options.write_at + ",send-to-method=" + options.send_to;
        Module.ccall("mono_wasm_load_profiler_coverage", null, ["string"], [arg]);
    }

    // Licensed to the .NET Foundation under one or more agreements.
    const fn_signatures = [
        ["_get_cs_owned_object_by_js_handle", "GetCSOwnedObjectByJSHandle", "ii!"],
        ["_get_cs_owned_object_js_handle", "GetCSOwnedObjectJSHandle", "mi"],
        ["_try_get_cs_owned_object_js_handle", "TryGetCSOwnedObjectJSHandle", "mi"],
        ["_create_cs_owned_proxy", "CreateCSOwnedProxy", "iii!"],
        ["_get_js_owned_object_by_gc_handle", "GetJSOwnedObjectByGCHandle", "i!"],
        ["_get_js_owned_object_gc_handle", "GetJSOwnedObjectGCHandle", "m"],
        ["_release_js_owned_object_by_gc_handle", "ReleaseJSOwnedObjectByGCHandle", "i"],
        ["_create_tcs", "CreateTaskSource", ""],
        ["_set_tcs_result", "SetTaskSourceResult", "io"],
        ["_set_tcs_failure", "SetTaskSourceFailure", "is"],
        ["_get_tcs_task", "GetTaskSourceTask", "i!"],
        ["_task_from_result", "TaskFromResult", "o!"],
        ["_setup_js_cont", "SetupJSContinuation", "mo"],
        ["_object_to_string", "ObjectToString", "m"],
        ["_get_date_value", "GetDateValue", "m"],
        ["_create_date_time", "CreateDateTime", "d!"],
        ["_create_uri", "CreateUri", "s!"],
        ["_is_simple_array", "IsSimpleArray", "m"],
    ];
    const wrapped_cs_functions = {};
    for (const sig of fn_signatures) {
        const wf = wrapped_cs_functions;
        // lazy init on first run
        wf[sig[0]] = function (...args) {
            const fce = runtimeHelpers.bind_runtime_method(sig[1], sig[2]);
            wf[sig[0]] = fce;
            return fce(...args);
        };
    }

    // Licensed to the .NET Foundation under one or more agreements.
    const _use_finalization_registry = typeof globalThis.FinalizationRegistry === "function";
    const _use_weak_ref = typeof globalThis.WeakRef === "function";
    let _js_owned_object_registry;
    // this is array, not map. We maintain list of gaps in _js_handle_free_list so that it could be as compact as possible
    const _cs_owned_objects_by_js_handle = [];
    const _js_handle_free_list = [];
    let _next_js_handle = 1;
    const _js_owned_object_table = new Map();
    // NOTE: FinalizationRegistry and WeakRef are missing on Safari below 14.1
    if (_use_finalization_registry) {
        _js_owned_object_registry = new globalThis.FinalizationRegistry(_js_owned_object_finalized);
    }
    const js_owned_gc_handle_symbol = Symbol.for("wasm js_owned_gc_handle");
    const cs_owned_js_handle_symbol = Symbol.for("wasm cs_owned_js_handle");
    function get_js_owned_object_by_gc_handle(gc_handle) {
        if (!gc_handle) {
            return MonoObjectNull;
        }
        // this is always strong gc_handle
        return wrapped_cs_functions._get_js_owned_object_by_gc_handle(gc_handle);
    }
    function mono_wasm_get_jsobj_from_js_handle(js_handle) {
        if (js_handle !== JSHandleNull && js_handle !== JSHandleDisposed)
            return _cs_owned_objects_by_js_handle[js_handle];
        return null;
    }
    // when should_add_in_flight === true, the JSObject would be temporarily hold by Normal gc_handle, so that it would not get collected during transition to the managed stack.
    // its InFlight gc_handle would be freed when the instance arrives to managed side via Interop.Runtime.ReleaseInFlight
    function get_cs_owned_object_by_js_handle(js_handle, should_add_in_flight) {
        if (js_handle === JSHandleNull || js_handle === JSHandleDisposed) {
            return MonoObjectNull;
        }
        return wrapped_cs_functions._get_cs_owned_object_by_js_handle(js_handle, should_add_in_flight ? 1 : 0);
    }
    function get_js_obj(js_handle) {
        if (js_handle !== JSHandleNull && js_handle !== JSHandleDisposed)
            return mono_wasm_get_jsobj_from_js_handle(js_handle);
        return null;
    }
    function _js_owned_object_finalized(gc_handle) {
        // The JS object associated with this gc_handle has been collected by the JS GC.
        // As such, it's not possible for this gc_handle to be invoked by JS anymore, so
        //  we can release the tracking weakref (it's null now, by definition),
        //  and tell the C# side to stop holding a reference to the managed object.
        // "The FinalizationRegistry callback is called potentially multiple times"
        if (_js_owned_object_table.delete(gc_handle)) {
            wrapped_cs_functions._release_js_owned_object_by_gc_handle(gc_handle);
        }
    }
    function _lookup_js_owned_object(gc_handle) {
        if (!gc_handle)
            return null;
        const wr = _js_owned_object_table.get(gc_handle);
        if (wr) {
            return wr.deref();
            // TODO: could this be null before _js_owned_object_finalized was called ?
            // TODO: are there race condition consequences ?
        }
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function _register_js_owned_object(gc_handle, js_obj) {
        let wr;
        if (_use_weak_ref) {
            wr = new WeakRef(js_obj);
        }
        else {
            // this is trivial WeakRef replacement, which holds strong refrence, instead of weak one, when the browser doesn't support it
            wr = {
                deref: () => {
                    return js_obj;
                }
            };
        }
        _js_owned_object_table.set(gc_handle, wr);
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function mono_wasm_get_js_handle(js_obj) {
        if (js_obj[cs_owned_js_handle_symbol]) {
            return js_obj[cs_owned_js_handle_symbol];
        }
        const js_handle = _js_handle_free_list.length ? _js_handle_free_list.pop() : _next_js_handle++;
        // note _cs_owned_objects_by_js_handle is list, not Map. That's why we maintain _js_handle_free_list.
        _cs_owned_objects_by_js_handle[js_handle] = js_obj;
        js_obj[cs_owned_js_handle_symbol] = js_handle;
        return js_handle;
    }
    function mono_wasm_release_cs_owned_object(js_handle) {
        const obj = _cs_owned_objects_by_js_handle[js_handle];
        if (typeof obj !== "undefined" && obj !== null) {
            // if this is the global object then do not
            // unregister it.
            if (globalThis === obj)
                return obj;
            if (typeof obj[cs_owned_js_handle_symbol] !== "undefined") {
                obj[cs_owned_js_handle_symbol] = undefined;
            }
            _cs_owned_objects_by_js_handle[js_handle] = undefined;
            _js_handle_free_list.push(js_handle);
        }
        return obj;
    }

    const _temp_mallocs = [];
    function temp_malloc(size) {
        if (!_temp_mallocs || !_temp_mallocs.length)
            throw new Error("No temp frames have been created at this point");
        const frame = _temp_mallocs[_temp_mallocs.length - 1] || [];
        const result = Module._malloc(size);
        frame.push(result);
        _temp_mallocs[_temp_mallocs.length - 1] = frame;
        return result;
    }
    function _create_temp_frame() {
        _temp_mallocs.push(null);
    }
    function _release_temp_frame() {
        if (!_temp_mallocs.length)
            throw new Error("No temp frames have been created at this point");
        const frame = _temp_mallocs.pop();
        if (!frame)
            return;
        for (let i = 0, l = frame.length; i < l; i++)
            Module._free(frame[i]);
    }
    function setU8(offset, value) {
        Module.HEAPU8[offset] = value;
    }
    function setU16(offset, value) {
        Module.HEAPU16[offset >>> 1] = value;
    }
    function setU32(offset, value) {
        Module.HEAPU32[offset >>> 2] = value;
    }
    function setI8(offset, value) {
        Module.HEAP8[offset] = value;
    }
    function setI16(offset, value) {
        Module.HEAP16[offset >>> 1] = value;
    }
    function setI32(offset, value) {
        Module.HEAP32[offset >>> 2] = value;
    }
    // NOTE: Accepts a number, not a BigInt, so values over Number.MAX_SAFE_INTEGER will be corrupted
    function setI64(offset, value) {
        Module.setValue(offset, value, "i64");
    }
    function setF32(offset, value) {
        Module.HEAPF32[offset >>> 2] = value;
    }
    function setF64(offset, value) {
        Module.HEAPF64[offset >>> 3] = value;
    }
    function getU8(offset) {
        return Module.HEAPU8[offset];
    }
    function getU16(offset) {
        return Module.HEAPU16[offset >>> 1];
    }
    function getU32(offset) {
        return Module.HEAPU32[offset >>> 2];
    }
    function getI8(offset) {
        return Module.HEAP8[offset];
    }
    function getI16(offset) {
        return Module.HEAP16[offset >>> 1];
    }
    function getI32(offset) {
        return Module.HEAP32[offset >>> 2];
    }
    // NOTE: Returns a number, not a BigInt. This means values over Number.MAX_SAFE_INTEGER will be corrupted
    function getI64(offset) {
        return Module.getValue(offset, "i64");
    }
    function getF32(offset) {
        return Module.HEAPF32[offset >>> 2];
    }
    function getF64(offset) {
        return Module.HEAPF64[offset >>> 3];
    }

    // Licensed to the .NET Foundation under one or more agreements.
    class StringDecoder {
        copy(mono_string) {
            if (!this.mono_wasm_string_decoder_buffer) {
                this.mono_text_decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : null;
                this.mono_wasm_string_root = mono_wasm_new_root();
                this.mono_wasm_string_decoder_buffer = Module._malloc(12);
            }
            if (mono_string === MonoStringNull)
                return null;
            this.mono_wasm_string_root.value = mono_string;
            const ppChars = this.mono_wasm_string_decoder_buffer + 0, pLengthBytes = this.mono_wasm_string_decoder_buffer + 4, pIsInterned = this.mono_wasm_string_decoder_buffer + 8;
            wrapped_c_functions.mono_wasm_string_get_data(mono_string, ppChars, pLengthBytes, pIsInterned);
            let result = mono_wasm_empty_string;
            const lengthBytes = getI32(pLengthBytes), pChars = getI32(ppChars), isInterned = getI32(pIsInterned);
            if (pLengthBytes && pChars) {
                if (isInterned &&
                    interned_string_table.has(mono_string) //TODO remove 2x lookup
                ) {
                    result = interned_string_table.get(mono_string);
                    // console.log(`intern table cache hit ${mono_string} ${result.length}`);
                }
                else {
                    result = this.decode(pChars, pChars + lengthBytes);
                    if (isInterned) {
                        // console.log("interned", mono_string, result.length);
                        interned_string_table.set(mono_string, result);
                    }
                }
            }
            this.mono_wasm_string_root.value = 0;
            return result;
        }
        decode(start, end) {
            let str = "";
            if (this.mono_text_decoder) {
                // When threading is enabled, TextDecoder does not accept a view of a
                // SharedArrayBuffer, we must make a copy of the array first.
                // See https://github.com/whatwg/encoding/issues/172
                const subArray = typeof SharedArrayBuffer !== "undefined" && Module.HEAPU8.buffer instanceof SharedArrayBuffer
                    ? Module.HEAPU8.slice(start, end)
                    : Module.HEAPU8.subarray(start, end);
                str = this.mono_text_decoder.decode(subArray);
            }
            else {
                for (let i = 0; i < end - start; i += 2) {
                    const char = Module.getValue(start + i, "i16");
                    str += String.fromCharCode(char);
                }
            }
            return str;
        }
    }
    const interned_string_table = new Map();
    const interned_js_string_table = new Map();
    let _empty_string_ptr = 0;
    const _interned_string_full_root_buffers = [];
    let _interned_string_current_root_buffer = null;
    let _interned_string_current_root_buffer_count = 0;
    const string_decoder = new StringDecoder();
    const mono_wasm_empty_string = "";
    function conv_string(mono_obj) {
        return string_decoder.copy(mono_obj);
    }
    // Ensures the string is already interned on both the managed and JavaScript sides,
    //  then returns the interned string value (to provide fast reference comparisons like C#)
    function mono_intern_string(string) {
        if (string.length === 0)
            return mono_wasm_empty_string;
        const ptr = js_string_to_mono_string_interned(string);
        const result = interned_string_table.get(ptr);
        return result;
    }
    function _store_string_in_intern_table(string, ptr, internIt) {
        if (!ptr)
            throw new Error("null pointer passed to _store_string_in_intern_table");
        else if (typeof (ptr) !== "number")
            throw new Error(`non-pointer passed to _store_string_in_intern_table: ${typeof (ptr)}`);
        const internBufferSize = 8192;
        if (_interned_string_current_root_buffer_count >= internBufferSize) {
            _interned_string_full_root_buffers.push(_interned_string_current_root_buffer);
            _interned_string_current_root_buffer = null;
        }
        if (!_interned_string_current_root_buffer) {
            _interned_string_current_root_buffer = mono_wasm_new_root_buffer(internBufferSize, "interned strings");
            _interned_string_current_root_buffer_count = 0;
        }
        const rootBuffer = _interned_string_current_root_buffer;
        const index = _interned_string_current_root_buffer_count++;
        rootBuffer.set(index, ptr);
        // Store the managed string into the managed intern table. This can theoretically
        //  provide a different managed object than the one we passed in, so update our
        //  pointer (stored in the root) with the result.
        if (internIt) {
            ptr = wrapped_c_functions.mono_wasm_intern_string(ptr);
            rootBuffer.set(index, ptr);
        }
        if (!ptr)
            throw new Error("mono_wasm_intern_string produced a null pointer");
        interned_js_string_table.set(string, ptr);
        interned_string_table.set(ptr, string);
        if ((string.length === 0) && !_empty_string_ptr)
            _empty_string_ptr = ptr;
        return ptr;
    }
    function js_string_to_mono_string_interned(string) {
        const text = (typeof (string) === "symbol")
            ? (string.description || Symbol.keyFor(string) || "<unknown Symbol>")
            : string;
        if ((text.length === 0) && _empty_string_ptr)
            return _empty_string_ptr;
        let ptr = interned_js_string_table.get(text);
        if (ptr)
            return ptr;
        ptr = js_string_to_mono_string_new(text);
        ptr = _store_string_in_intern_table(text, ptr, true);
        return ptr;
    }
    function js_string_to_mono_string(string) {
        if (string === null)
            return null;
        else if (typeof (string) === "symbol")
            return js_string_to_mono_string_interned(string);
        else if (typeof (string) !== "string")
            throw new Error("Expected string argument, got " + typeof (string));
        // Always use an interned pointer for empty strings
        if (string.length === 0)
            return js_string_to_mono_string_interned(string);
        // Looking up large strings in the intern table will require the JS runtime to
        //  potentially hash them and then do full byte-by-byte comparisons, which is
        //  very expensive. Because we can not guarantee it won't happen, try to minimize
        //  the cost of this and prevent performance issues for large strings
        if (string.length <= 256) {
            const interned = interned_js_string_table.get(string);
            if (interned)
                return interned;
        }
        return js_string_to_mono_string_new(string);
    }
    function js_string_to_mono_string_new(string) {
        const buffer = Module._malloc((string.length + 1) * 2);
        const buffer16 = (buffer >>> 1) | 0;
        for (let i = 0; i < string.length; i++)
            Module.HEAP16[buffer16 + i] = string.charCodeAt(i);
        Module.HEAP16[buffer16 + string.length] = 0;
        const result = wrapped_c_functions.mono_wasm_string_from_utf16(buffer, string.length);
        Module._free(buffer);
        return result;
    }

    // Licensed to the .NET Foundation under one or more agreements.
    const _are_promises_supported = ((typeof Promise === "object") || (typeof Promise === "function")) && (typeof Promise.resolve === "function");
    const promise_control_symbol = Symbol.for("wasm promise_control");
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function isThenable(js_obj) {
        // When using an external Promise library like Bluebird the Promise.resolve may not be sufficient
        // to identify the object as a Promise.
        return Promise.resolve(js_obj) === js_obj ||
            ((typeof js_obj === "object" || typeof js_obj === "function") && typeof js_obj.then === "function");
    }
    function mono_wasm_cancel_promise(thenable_js_handle, is_exception) {
        try {
            const promise = mono_wasm_get_jsobj_from_js_handle(thenable_js_handle);
            const promise_control = promise[promise_control_symbol];
            promise_control.reject("OperationCanceledException");
        }
        catch (ex) {
            return wrap_error(is_exception, ex);
        }
    }
    function _create_cancelable_promise(afterResolve, afterReject) {
        let promise_control = null;
        const promise = new Promise(function (resolve, reject) {
            promise_control = {
                isDone: false,
                resolve: (data) => {
                    if (!promise_control.isDone) {
                        promise_control.isDone = true;
                        resolve(data);
                        if (afterResolve) {
                            afterResolve();
                        }
                    }
                },
                reject: (reason) => {
                    if (!promise_control.isDone) {
                        promise_control.isDone = true;
                        reject(reason);
                        if (afterReject) {
                            afterReject();
                        }
                    }
                }
            };
        });
        promise[promise_control_symbol] = promise_control;
        return { promise, promise_control: promise_control };
    }

    // Licensed to the .NET Foundation under one or more agreements.
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function _js_to_mono_uri(should_add_in_flight, js_obj) {
        switch (true) {
            case js_obj === null:
            case typeof js_obj === "undefined":
                return MonoObjectNull;
            case typeof js_obj === "symbol":
            case typeof js_obj === "string":
                return wrapped_cs_functions._create_uri(js_obj);
            default:
                return _extract_mono_obj(should_add_in_flight, js_obj);
        }
    }
    // this is only used from Blazor
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function js_to_mono_obj(js_obj) {
        return _js_to_mono_obj(false, js_obj);
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function _js_to_mono_obj(should_add_in_flight, js_obj) {
        switch (true) {
            case js_obj === null:
            case typeof js_obj === "undefined":
                return MonoObjectNull;
            case typeof js_obj === "number": {
                let result = null;
                if ((js_obj | 0) === js_obj)
                    result = _box_js_int(js_obj);
                else if ((js_obj >>> 0) === js_obj)
                    result = _box_js_uint(js_obj);
                else
                    result = _box_js_double(js_obj);
                if (!result)
                    throw new Error(`Boxing failed for ${js_obj}`);
                return result;
            }
            case typeof js_obj === "string":
                return js_string_to_mono_string(js_obj);
            case typeof js_obj === "symbol":
                return js_string_to_mono_string_interned(js_obj);
            case typeof js_obj === "boolean":
                return _box_js_bool(js_obj);
            case isThenable(js_obj) === true: {
                const { task_ptr } = _wrap_js_thenable_as_task(js_obj);
                // task_ptr above is not rooted, we need to return it to mono without any intermediate mono call which could cause GC
                return task_ptr;
            }
            case js_obj.constructor.name === "Date":
                // getTime() is always UTC
                return wrapped_cs_functions._create_date_time(js_obj.getTime());
            default:
                return _extract_mono_obj(should_add_in_flight, js_obj);
        }
    }
    function _extract_mono_obj(should_add_in_flight, js_obj) {
        if (js_obj === null || typeof js_obj === "undefined")
            return MonoObjectNull;
        let result = null;
        if (js_obj[js_owned_gc_handle_symbol]) {
            // for js_owned_gc_handle we don't want to create new proxy
            // since this is strong gc_handle we don't need to in-flight reference
            result = get_js_owned_object_by_gc_handle(js_obj[js_owned_gc_handle_symbol]);
            return result;
        }
        if (js_obj[cs_owned_js_handle_symbol]) {
            result = get_cs_owned_object_by_js_handle(js_obj[cs_owned_js_handle_symbol], should_add_in_flight);
            // It's possible the managed object corresponding to this JS object was collected,
            //  in which case we need to make a new one.
            if (!result) {
                delete js_obj[cs_owned_js_handle_symbol];
            }
        }
        if (!result) {
            // Obtain the JS -> C# type mapping.
            const wasm_type = js_obj[wasm_type_symbol];
            const wasm_type_id = typeof wasm_type === "undefined" ? 0 : wasm_type;
            const js_handle = mono_wasm_get_js_handle(js_obj);
            result = wrapped_cs_functions._create_cs_owned_proxy(js_handle, wasm_type_id, should_add_in_flight ? 1 : 0);
        }
        return result;
    }
    function _box_js_int(js_obj) {
        setI32(runtimeHelpers._box_buffer, js_obj);
        return wrapped_c_functions.mono_wasm_box_primitive(runtimeHelpers._class_int32, runtimeHelpers._box_buffer, 4);
    }
    function _box_js_uint(js_obj) {
        setU32(runtimeHelpers._box_buffer, js_obj);
        return wrapped_c_functions.mono_wasm_box_primitive(runtimeHelpers._class_uint32, runtimeHelpers._box_buffer, 4);
    }
    function _box_js_double(js_obj) {
        setF64(runtimeHelpers._box_buffer, js_obj);
        return wrapped_c_functions.mono_wasm_box_primitive(runtimeHelpers._class_double, runtimeHelpers._box_buffer, 8);
    }
    function _box_js_bool(js_obj) {
        setI32(runtimeHelpers._box_buffer, js_obj ? 1 : 0);
        return wrapped_c_functions.mono_wasm_box_primitive(runtimeHelpers._class_boolean, runtimeHelpers._box_buffer, 4);
    }
    // https://github.com/Planeshifter/emscripten-examples/blob/master/01_PassingArrays/sum_post.js
    function js_typedarray_to_heap(typedArray) {
        const numBytes = typedArray.length * typedArray.BYTES_PER_ELEMENT;
        const ptr = Module._malloc(numBytes);
        const heapBytes = new Uint8Array(Module.HEAPU8.buffer, ptr, numBytes);
        heapBytes.set(new Uint8Array(typedArray.buffer, typedArray.byteOffset, numBytes));
        return heapBytes;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function js_typed_array_to_array(js_obj) {
        // JavaScript typed arrays are array-like objects and provide a mechanism for accessing
        // raw binary data. (...) To achieve maximum flexibility and efficiency, JavaScript typed arrays
        // split the implementation into buffers and views. A buffer (implemented by the ArrayBuffer object)
        //  is an object representing a chunk of data; it has no format to speak of, and offers no
        // mechanism for accessing its contents. In order to access the memory contained in a buffer,
        // you need to use a view. A view provides a context — that is, a data type, starting offset,
        // and number of elements — that turns the data into an actual typed array.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
        if (has_backing_array_buffer(js_obj) && js_obj.BYTES_PER_ELEMENT) {
            const arrayType = js_obj[wasm_type_symbol];
            const heapBytes = js_typedarray_to_heap(js_obj);
            const bufferArray = wrapped_c_functions.mono_wasm_typed_array_new(heapBytes.byteOffset, js_obj.length, js_obj.BYTES_PER_ELEMENT, arrayType);
            Module._free(heapBytes.byteOffset);
            return bufferArray;
        }
        else {
            throw new Error("Object '" + js_obj + "' is not a typed array");
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-module-boundary-types
    function js_to_mono_enum(js_obj, method, parmIdx) {
        if (typeof (js_obj) !== "number")
            throw new Error(`Expected numeric value for enum argument, got '${js_obj}'`);
        return js_obj | 0;
    }
    function js_array_to_mono_array(js_array, asString, should_add_in_flight) {
        const mono_array = asString ? wrapped_c_functions.mono_wasm_string_array_new(js_array.length) : wrapped_c_functions.mono_wasm_obj_array_new(js_array.length);
        const arrayRoot = mono_wasm_new_root(mono_array);
        const elemRoot = mono_wasm_new_root(MonoObjectNull);
        try {
            for (let i = 0; i < js_array.length; ++i) {
                let obj = js_array[i];
                if (asString)
                    obj = obj.toString();
                elemRoot.value = _js_to_mono_obj(should_add_in_flight, obj);
                wrapped_c_functions.mono_wasm_obj_array_set(arrayRoot.value, i, elemRoot.value);
            }
            return mono_array;
        }
        finally {
            mono_wasm_release_roots(arrayRoot, elemRoot);
        }
    }
    function _wrap_js_thenable_as_task(thenable) {
        if (!thenable)
            return null;
        // hold strong JS reference to thenable while in flight
        // ideally, this should be hold alive by lifespan of the resulting C# Task, but this is good cheap aproximation
        const thenable_js_handle = mono_wasm_get_js_handle(thenable);
        // Note that we do not implement promise/task roundtrip. 
        // With more complexity we could recover original instance when this Task is marshaled back to JS.
        // TODO optimization: return the tcs.Task on this same call instead of _get_tcs_task
        const tcs_gc_handle = wrapped_cs_functions._create_tcs();
        thenable.then((result) => {
            wrapped_cs_functions._set_tcs_result(tcs_gc_handle, result);
            // let go of the thenable reference
            mono_wasm_release_cs_owned_object(thenable_js_handle);
            // when FinalizationRegistry is not supported by this browser, we will do immediate cleanup after promise resolve/reject
            if (!_use_finalization_registry) {
                wrapped_cs_functions._release_js_owned_object_by_gc_handle(tcs_gc_handle);
            }
        }, (reason) => {
            wrapped_cs_functions._set_tcs_failure(tcs_gc_handle, reason ? reason.toString() : "");
            // let go of the thenable reference
            mono_wasm_release_cs_owned_object(thenable_js_handle);
            // when FinalizationRegistry is not supported by this browser, we will do immediate cleanup after promise resolve/reject
            if (!_use_finalization_registry) {
                wrapped_cs_functions._release_js_owned_object_by_gc_handle(tcs_gc_handle);
            }
        });
        // collect the TaskCompletionSource with its Task after js doesn't hold the thenable anymore
        if (_use_finalization_registry) {
            _js_owned_object_registry.register(thenable, tcs_gc_handle);
        }
        // returns raw pointer to tcs.Task
        return {
            task_ptr: wrapped_cs_functions._get_tcs_task(tcs_gc_handle),
            then_js_handle: thenable_js_handle,
        };
    }
    function mono_wasm_typed_array_to_array(js_handle, is_exception) {
        const js_obj = mono_wasm_get_jsobj_from_js_handle(js_handle);
        if (!js_obj) {
            return wrap_error(is_exception, "ERR06: Invalid JS object handle '" + js_handle + "'");
        }
        // returns pointer to C# array
        return js_typed_array_to_array(js_obj);
    }

    // Licensed to the .NET Foundation under one or more agreements.
    // see src/mono/wasm/driver.c MARSHAL_TYPE_xxx and Runtime.cs MarshalType
    var MarshalType;
    (function (MarshalType) {
        MarshalType[MarshalType["NULL"] = 0] = "NULL";
        MarshalType[MarshalType["INT"] = 1] = "INT";
        MarshalType[MarshalType["FP64"] = 2] = "FP64";
        MarshalType[MarshalType["STRING"] = 3] = "STRING";
        MarshalType[MarshalType["VT"] = 4] = "VT";
        MarshalType[MarshalType["DELEGATE"] = 5] = "DELEGATE";
        MarshalType[MarshalType["TASK"] = 6] = "TASK";
        MarshalType[MarshalType["OBJECT"] = 7] = "OBJECT";
        MarshalType[MarshalType["BOOL"] = 8] = "BOOL";
        MarshalType[MarshalType["ENUM"] = 9] = "ENUM";
        MarshalType[MarshalType["URI"] = 22] = "URI";
        MarshalType[MarshalType["SAFEHANDLE"] = 23] = "SAFEHANDLE";
        MarshalType[MarshalType["ARRAY_BYTE"] = 10] = "ARRAY_BYTE";
        MarshalType[MarshalType["ARRAY_UBYTE"] = 11] = "ARRAY_UBYTE";
        MarshalType[MarshalType["ARRAY_UBYTE_C"] = 12] = "ARRAY_UBYTE_C";
        MarshalType[MarshalType["ARRAY_SHORT"] = 13] = "ARRAY_SHORT";
        MarshalType[MarshalType["ARRAY_USHORT"] = 14] = "ARRAY_USHORT";
        MarshalType[MarshalType["ARRAY_INT"] = 15] = "ARRAY_INT";
        MarshalType[MarshalType["ARRAY_UINT"] = 16] = "ARRAY_UINT";
        MarshalType[MarshalType["ARRAY_FLOAT"] = 17] = "ARRAY_FLOAT";
        MarshalType[MarshalType["ARRAY_DOUBLE"] = 18] = "ARRAY_DOUBLE";
        MarshalType[MarshalType["FP32"] = 24] = "FP32";
        MarshalType[MarshalType["UINT32"] = 25] = "UINT32";
        MarshalType[MarshalType["INT64"] = 26] = "INT64";
        MarshalType[MarshalType["UINT64"] = 27] = "UINT64";
        MarshalType[MarshalType["CHAR"] = 28] = "CHAR";
        MarshalType[MarshalType["STRING_INTERNED"] = 29] = "STRING_INTERNED";
        MarshalType[MarshalType["VOID"] = 30] = "VOID";
        MarshalType[MarshalType["ENUM64"] = 31] = "ENUM64";
        MarshalType[MarshalType["POINTER"] = 32] = "POINTER";
    })(MarshalType || (MarshalType = {}));
    // see src/mono/wasm/driver.c MARSHAL_ERROR_xxx and Runtime.cs
    var MarshalError;
    (function (MarshalError) {
        MarshalError[MarshalError["BUFFER_TOO_SMALL"] = 512] = "BUFFER_TOO_SMALL";
        MarshalError[MarshalError["NULL_CLASS_POINTER"] = 513] = "NULL_CLASS_POINTER";
        MarshalError[MarshalError["NULL_TYPE_POINTER"] = 514] = "NULL_TYPE_POINTER";
        MarshalError[MarshalError["UNSUPPORTED_TYPE"] = 515] = "UNSUPPORTED_TYPE";
        MarshalError[MarshalError["FIRST"] = 512] = "FIRST";
    })(MarshalError || (MarshalError = {}));
    const delegate_invoke_symbol = Symbol.for("wasm delegate_invoke");
    const delegate_invoke_signature_symbol = Symbol.for("wasm delegate_invoke_signature");
    // this is only used from Blazor
    function unbox_mono_obj(mono_obj) {
        if (mono_obj === MonoObjectNull)
            return undefined;
        const root = mono_wasm_new_root(mono_obj);
        try {
            return _unbox_mono_obj_root(root);
        }
        finally {
            root.release();
        }
    }
    function _unbox_cs_owned_root_as_js_object(root) {
        // we don't need in-flight reference as we already have it rooted here
        const js_handle = wrapped_cs_functions._get_cs_owned_object_js_handle(root.value, 0);
        const js_obj = mono_wasm_get_jsobj_from_js_handle(js_handle);
        return js_obj;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function _unbox_mono_obj_root_with_known_nonprimitive_type_impl(root, type, typePtr, unbox_buffer) {
        //See MARSHAL_TYPE_ defines in driver.c
        switch (type) {
            case MarshalType.INT64:
            case MarshalType.UINT64:
                // TODO: Fix this once emscripten offers HEAPI64/HEAPU64 or can return them
                throw new Error("int64 not available");
            case MarshalType.STRING:
            case MarshalType.STRING_INTERNED:
                return conv_string(root.value);
            case MarshalType.VT:
                throw new Error("no idea on how to unbox value types");
            case MarshalType.DELEGATE:
                return _wrap_delegate_root_as_function(root);
            case MarshalType.TASK:
                return _unbox_task_root_as_promise(root);
            case MarshalType.OBJECT:
                return _unbox_ref_type_root_as_js_object(root);
            case MarshalType.ARRAY_BYTE:
            case MarshalType.ARRAY_UBYTE:
            case MarshalType.ARRAY_UBYTE_C:
            case MarshalType.ARRAY_SHORT:
            case MarshalType.ARRAY_USHORT:
            case MarshalType.ARRAY_INT:
            case MarshalType.ARRAY_UINT:
            case MarshalType.ARRAY_FLOAT:
            case MarshalType.ARRAY_DOUBLE:
                throw new Error("Marshalling of primitive arrays are not supported.  Use the corresponding TypedArray instead.");
            case 20: // clr .NET DateTime
                return new Date(wrapped_cs_functions._get_date_value(root.value));
            case 21: // clr .NET DateTimeOffset
                return wrapped_cs_functions._object_to_string(root.value);
            case MarshalType.URI:
                return wrapped_cs_functions._object_to_string(root.value);
            case MarshalType.SAFEHANDLE:
                return _unbox_cs_owned_root_as_js_object(root);
            case MarshalType.VOID:
                return undefined;
            default:
                throw new Error(`no idea on how to unbox object of MarshalType ${type} at offset ${root.value} (root address is ${root.get_address()})`);
        }
    }
    function _unbox_mono_obj_root_with_known_nonprimitive_type(root, type, unbox_buffer) {
        if (type >= MarshalError.FIRST)
            throw new Error(`Got marshaling error ${type} when attempting to unbox object at address ${root.value} (root located at ${root.get_address()})`);
        let typePtr = MonoTypeNull;
        if ((type === MarshalType.VT) || (type == MarshalType.OBJECT)) {
            typePtr = getU32(unbox_buffer);
            if (typePtr < 1024)
                throw new Error(`Got invalid MonoType ${typePtr} for object at address ${root.value} (root located at ${root.get_address()})`);
        }
        return _unbox_mono_obj_root_with_known_nonprimitive_type_impl(root, type, typePtr, unbox_buffer);
    }
    function _unbox_mono_obj_root(root) {
        if (root.value === 0)
            return undefined;
        const unbox_buffer = runtimeHelpers._unbox_buffer;
        const type = wrapped_c_functions.mono_wasm_try_unbox_primitive_and_get_type(root.value, unbox_buffer, runtimeHelpers._unbox_buffer_size);
        switch (type) {
            case MarshalType.INT:
                return getI32(unbox_buffer);
            case MarshalType.UINT32:
                return getU32(unbox_buffer);
            case MarshalType.POINTER:
                // FIXME: Is this right?
                return getU32(unbox_buffer);
            case MarshalType.FP32:
                return getF32(unbox_buffer);
            case MarshalType.FP64:
                return getF64(unbox_buffer);
            case MarshalType.BOOL:
                return (getI32(unbox_buffer)) !== 0;
            case MarshalType.CHAR:
                return String.fromCharCode(getI32(unbox_buffer));
            case MarshalType.NULL:
                return null;
            default:
                return _unbox_mono_obj_root_with_known_nonprimitive_type(root, type, unbox_buffer);
        }
    }
    function mono_array_to_js_array(mono_array) {
        if (mono_array === MonoArrayNull)
            return null;
        const arrayRoot = mono_wasm_new_root(mono_array);
        try {
            return _mono_array_root_to_js_array(arrayRoot);
        }
        finally {
            arrayRoot.release();
        }
    }
    function is_nested_array(ele) {
        return wrapped_cs_functions._is_simple_array(ele);
    }
    function _mono_array_root_to_js_array(arrayRoot) {
        if (arrayRoot.value === MonoArrayNull)
            return null;
        const elemRoot = mono_wasm_new_root();
        try {
            const len = wrapped_c_functions.mono_wasm_array_length(arrayRoot.value);
            const res = new Array(len);
            for (let i = 0; i < len; ++i) {
                elemRoot.value = wrapped_c_functions.mono_wasm_array_get(arrayRoot.value, i);
                if (is_nested_array(elemRoot.value))
                    res[i] = _mono_array_root_to_js_array(elemRoot);
                else
                    res[i] = _unbox_mono_obj_root(elemRoot);
            }
            return res;
        }
        finally {
            elemRoot.release();
        }
    }
    function _wrap_delegate_root_as_function(root) {
        if (root.value === MonoObjectNull)
            return null;
        // get strong reference to the Delegate
        const gc_handle = wrapped_cs_functions._get_js_owned_object_gc_handle(root.value);
        return _wrap_delegate_gc_handle_as_function(gc_handle);
    }
    function _wrap_delegate_gc_handle_as_function(gc_handle, after_listener_callback) {
        // see if we have js owned instance for this gc_handle already
        let result = _lookup_js_owned_object(gc_handle);
        // If the function for this gc_handle was already collected (or was never created)
        if (!result) {
            // note that we do not implement function/delegate roundtrip
            result = function (...args) {
                const delegateRoot = mono_wasm_new_root(get_js_owned_object_by_gc_handle(gc_handle));
                try {
                    const res = call_method(result[delegate_invoke_symbol], delegateRoot.value, result[delegate_invoke_signature_symbol], args);
                    if (after_listener_callback) {
                        after_listener_callback();
                    }
                    return res;
                }
                finally {
                    delegateRoot.release();
                }
            };
            // bind the method
            const delegateRoot = mono_wasm_new_root(get_js_owned_object_by_gc_handle(gc_handle));
            try {
                if (typeof result[delegate_invoke_symbol] === "undefined") {
                    result[delegate_invoke_symbol] = wrapped_c_functions.mono_wasm_get_delegate_invoke(delegateRoot.value);
                    if (!result[delegate_invoke_symbol]) {
                        throw new Error("System.Delegate Invoke method can not be resolved.");
                    }
                }
                if (typeof result[delegate_invoke_signature_symbol] === "undefined") {
                    result[delegate_invoke_signature_symbol] = mono_method_get_call_signature(result[delegate_invoke_symbol], delegateRoot.value);
                }
            }
            finally {
                delegateRoot.release();
            }
            // NOTE: this would be leaking C# objects when the browser doesn't support FinalizationRegistry. Except in case of EventListener where we cleanup after unregistration.
            if (_use_finalization_registry) {
                // register for GC of the deleate after the JS side is done with the function
                _js_owned_object_registry.register(result, gc_handle);
            }
            // register for instance reuse
            // NOTE: this would be leaking C# objects when the browser doesn't support FinalizationRegistry/WeakRef. Except in case of EventListener where we cleanup after unregistration.
            _register_js_owned_object(gc_handle, result);
        }
        return result;
    }
    function mono_wasm_create_cs_owned_object(core_name, args, is_exception) {
        const argsRoot = mono_wasm_new_root(args), nameRoot = mono_wasm_new_root(core_name);
        try {
            const js_name = conv_string(nameRoot.value);
            if (!js_name) {
                return wrap_error(is_exception, "Invalid name @" + nameRoot.value);
            }
            const coreObj = globalThis[js_name];
            if (coreObj === null || typeof coreObj === "undefined") {
                return wrap_error(is_exception, "JavaScript host object '" + js_name + "' not found.");
            }
            try {
                const js_args = _mono_array_root_to_js_array(argsRoot);
                // This is all experimental !!!!!!
                const allocator = function (constructor, js_args) {
                    // Not sure if we should be checking for anything here
                    let argsList = [];
                    argsList[0] = constructor;
                    if (js_args)
                        argsList = argsList.concat(js_args);
                    // eslint-disable-next-line prefer-spread
                    const tempCtor = constructor.bind.apply(constructor, argsList);
                    const js_obj = new tempCtor();
                    return js_obj;
                };
                const js_obj = allocator(coreObj, js_args);
                const js_handle = mono_wasm_get_js_handle(js_obj);
                // returns boxed js_handle int, because on exception we need to return String on same method signature
                // here we don't have anything to in-flight reference, as the JSObject doesn't exist yet
                return _js_to_mono_obj(false, js_handle);
            }
            catch (ex) {
                return wrap_error(is_exception, ex);
            }
        }
        finally {
            argsRoot.release();
            nameRoot.release();
        }
    }
    function _unbox_task_root_as_promise(root) {
        if (root.value === MonoObjectNull)
            return null;
        if (!_are_promises_supported)
            throw new Error("Promises are not supported thus 'System.Threading.Tasks.Task' can not work in this context.");
        // get strong reference to Task
        const gc_handle = wrapped_cs_functions._get_js_owned_object_gc_handle(root.value);
        // see if we have js owned instance for this gc_handle already
        let result = _lookup_js_owned_object(gc_handle);
        // If the promise for this gc_handle was already collected (or was never created)
        if (!result) {
            const explicitFinalization = _use_finalization_registry
                ? undefined
                : () => _js_owned_object_finalized(gc_handle);
            const { promise, promise_control } = _create_cancelable_promise(explicitFinalization, explicitFinalization);
            // note that we do not implement promise/task roundtrip
            // With more complexity we could recover original instance when this promise is marshaled back to C#.
            result = promise;
            // register C# side of the continuation
            wrapped_cs_functions._setup_js_cont(root.value, promise_control);
            // register for GC of the Task after the JS side is done with the promise
            if (_use_finalization_registry) {
                _js_owned_object_registry.register(result, gc_handle);
            }
            // register for instance reuse
            _register_js_owned_object(gc_handle, result);
        }
        return result;
    }
    function _unbox_ref_type_root_as_js_object(root) {
        if (root.value === MonoObjectNull)
            return null;
        // this could be JSObject proxy of a js native object
        // we don't need in-flight reference as we already have it rooted here
        const js_handle = wrapped_cs_functions._try_get_cs_owned_object_js_handle(root.value, 0);
        if (js_handle) {
            if (js_handle === JSHandleDisposed) {
                throw new Error("Cannot access a disposed JSObject at " + root.value);
            }
            return mono_wasm_get_jsobj_from_js_handle(js_handle);
        }
        // otherwise this is C# only object
        // get strong reference to Object
        const gc_handle = wrapped_cs_functions._get_js_owned_object_gc_handle(root.value);
        // see if we have js owned instance for this gc_handle already
        let result = _lookup_js_owned_object(gc_handle);
        // If the JS object for this gc_handle was already collected (or was never created)
        if (!result) {
            result = {};
            // keep the gc_handle so that we could easily convert it back to original C# object for roundtrip
            result[js_owned_gc_handle_symbol] = gc_handle;
            // NOTE: this would be leaking C# objects when the browser doesn't support FinalizationRegistry/WeakRef
            if (_use_finalization_registry) {
                // register for GC of the C# object after the JS side is done with the object
                _js_owned_object_registry.register(result, gc_handle);
            }
            // register for instance reuse
            // NOTE: this would be leaking C# objects when the browser doesn't support FinalizationRegistry/WeakRef
            _register_js_owned_object(gc_handle, result);
        }
        return result;
    }

    // Licensed to the .NET Foundation under one or more agreements.
    const primitiveConverters = new Map();
    const _signature_converters = new Map();
    const _method_descriptions = new Map();
    function _get_type_name(typePtr) {
        if (!typePtr)
            return "<null>";
        return wrapped_c_functions.mono_wasm_get_type_name(typePtr);
    }
    function _get_type_aqn(typePtr) {
        if (!typePtr)
            return "<null>";
        return wrapped_c_functions.mono_wasm_get_type_aqn(typePtr);
    }
    function _get_class_name(classPtr) {
        if (!classPtr)
            return "<null>";
        return wrapped_c_functions.mono_wasm_get_type_name(wrapped_c_functions.mono_wasm_class_get_type(classPtr));
    }
    function find_method(klass, name, n) {
        const result = wrapped_c_functions.mono_wasm_assembly_find_method(klass, name, n);
        if (result) {
            _method_descriptions.set(result, name);
        }
        return result;
    }
    function get_method(method_name) {
        const res = find_method(runtimeHelpers.wasm_runtime_class, method_name, -1);
        if (!res)
            throw "Can't find method " + runtimeHelpers.runtime_namespace + "." + runtimeHelpers.runtime_classname + ":" + method_name;
        return res;
    }
    function bind_runtime_method(method_name, signature) {
        const method = get_method(method_name);
        return mono_bind_method(method, null, signature, "BINDINGS_" + method_name);
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function _create_named_function(name, argumentNames, body, closure) {
        let result = null;
        let closureArgumentList = null;
        let closureArgumentNames = null;
        if (closure) {
            closureArgumentNames = Object.keys(closure);
            closureArgumentList = new Array(closureArgumentNames.length);
            for (let i = 0, l = closureArgumentNames.length; i < l; i++)
                closureArgumentList[i] = closure[closureArgumentNames[i]];
        }
        const constructor = _create_rebindable_named_function(name, argumentNames, body, closureArgumentNames);
        // eslint-disable-next-line prefer-spread
        result = constructor.apply(null, closureArgumentList);
        return result;
    }
    function _create_rebindable_named_function(name, argumentNames, body, closureArgNames) {
        const strictPrefix = "\"use strict\";\r\n";
        let uriPrefix = "", escapedFunctionIdentifier = "";
        if (name) {
            uriPrefix = "//# sourceURL=https://mono-wasm.invalid/" + name + "\r\n";
            escapedFunctionIdentifier = name;
        }
        else {
            escapedFunctionIdentifier = "unnamed";
        }
        let rawFunctionText = "function " + escapedFunctionIdentifier + "(" +
            argumentNames.join(", ") +
            ") {\r\n" +
            body +
            "\r\n};\r\n";
        const lineBreakRE = /\r(\n?)/g;
        rawFunctionText =
            uriPrefix + strictPrefix +
                rawFunctionText.replace(lineBreakRE, "\r\n    ") +
                `    return ${escapedFunctionIdentifier};\r\n`;
        let result = null, keys = null;
        if (closureArgNames) {
            keys = closureArgNames.concat([rawFunctionText]);
        }
        else {
            keys = [rawFunctionText];
        }
        result = Function.apply(Function, keys);
        return result;
    }
    function _create_primitive_converters() {
        const result = primitiveConverters;
        result.set("m", { steps: [{}], size: 0 });
        result.set("s", { steps: [{ convert: js_string_to_mono_string.bind(BINDING$1) }], size: 0, needs_root: true });
        result.set("S", { steps: [{ convert: js_string_to_mono_string_interned.bind(BINDING$1) }], size: 0, needs_root: true });
        // note we also bind first argument to false for both _js_to_mono_obj and _js_to_mono_uri, 
        // because we will root the reference, so we don't need in-flight reference
        // also as those are callback arguments and we don't have platform code which would release the in-flight reference on C# end
        result.set("o", { steps: [{ convert: _js_to_mono_obj.bind(BINDING$1, false) }], size: 0, needs_root: true });
        result.set("u", { steps: [{ convert: _js_to_mono_uri.bind(BINDING$1, false) }], size: 0, needs_root: true });
        // result.set ('k', { steps: [{ convert: js_to_mono_enum.bind (this), indirect: 'i64'}], size: 8});
        result.set("j", { steps: [{ convert: js_to_mono_enum.bind(BINDING$1), indirect: "i32" }], size: 8 });
        result.set("i", { steps: [{ indirect: "i32" }], size: 8 });
        result.set("l", { steps: [{ indirect: "i64" }], size: 8 });
        result.set("f", { steps: [{ indirect: "float" }], size: 8 });
        result.set("d", { steps: [{ indirect: "double" }], size: 8 });
    }
    function _create_converter_for_marshal_string(args_marshal) {
        const steps = [];
        let size = 0;
        let is_result_definitely_unmarshaled = false, is_result_possibly_unmarshaled = false, result_unmarshaled_if_argc = -1, needs_root_buffer = false;
        for (let i = 0; i < args_marshal.length; ++i) {
            const key = args_marshal[i];
            if (i === args_marshal.length - 1) {
                if (key === "!") {
                    is_result_definitely_unmarshaled = true;
                    continue;
                }
                else if (key === "m") {
                    is_result_possibly_unmarshaled = true;
                    result_unmarshaled_if_argc = args_marshal.length - 1;
                }
            }
            else if (key === "!")
                throw new Error("! must be at the end of the signature");
            const conv = primitiveConverters.get(key);
            if (!conv)
                throw new Error("Unknown parameter type " + key);
            const localStep = Object.create(conv.steps[0]);
            localStep.size = conv.size;
            if (conv.needs_root)
                needs_root_buffer = true;
            localStep.needs_root = conv.needs_root;
            localStep.key = key;
            steps.push(localStep);
            size += conv.size;
        }
        return {
            steps, size, args_marshal,
            is_result_definitely_unmarshaled,
            is_result_possibly_unmarshaled,
            result_unmarshaled_if_argc,
            needs_root_buffer
        };
    }
    function _get_converter_for_marshal_string(args_marshal) {
        let converter = _signature_converters.get(args_marshal);
        if (!converter) {
            converter = _create_converter_for_marshal_string(args_marshal);
            _signature_converters.set(args_marshal, converter);
        }
        return converter;
    }
    function _compile_converter_for_marshal_string(args_marshal) {
        const converter = _get_converter_for_marshal_string(args_marshal);
        if (typeof (converter.args_marshal) !== "string")
            throw new Error("Corrupt converter for '" + args_marshal + "'");
        if (converter.compiled_function && converter.compiled_variadic_function)
            return converter;
        const converterName = args_marshal.replace("!", "_result_unmarshaled");
        converter.name = converterName;
        let body = [];
        let argumentNames = ["buffer", "rootBuffer", "method"];
        // worst-case allocation size instead of allocating dynamically, plus padding
        const bufferSizeBytes = converter.size + (args_marshal.length * 4) + 16;
        // ensure the indirect values are 8-byte aligned so that aligned loads and stores will work
        const indirectBaseOffset = ((((args_marshal.length * 4) + 7) / 8) | 0) * 8;
        const closure = {
            Module,
            _malloc: Module._malloc,
            mono_wasm_unbox_rooted: wrapped_c_functions.mono_wasm_unbox_rooted,
            setI32,
            setU32,
            setF32,
            setF64,
            setI64
        };
        let indirectLocalOffset = 0;
        body.push("if (!method) throw new Error('no method provided');", `if (!buffer) buffer = _malloc (${bufferSizeBytes});`, `let indirectStart = buffer + ${indirectBaseOffset};`, "");
        for (let i = 0; i < converter.steps.length; i++) {
            const step = converter.steps[i];
            const closureKey = "step" + i;
            const valueKey = "value" + i;
            const argKey = "arg" + i;
            argumentNames.push(argKey);
            if (step.convert) {
                closure[closureKey] = step.convert;
                body.push(`let ${valueKey} = ${closureKey}(${argKey}, method, ${i});`);
            }
            else {
                body.push(`let ${valueKey} = ${argKey};`);
            }
            if (step.needs_root) {
                body.push("if (!rootBuffer) throw new Error('no root buffer provided');");
                body.push(`rootBuffer.set (${i}, ${valueKey});`);
            }
            // HACK: needs_unbox indicates that we were passed a pointer to a managed object, and either
            //  it was already rooted by our caller or (needs_root = true) by us. Now we can unbox it and
            //  pass the raw address of its boxed value into the callee.
            // FIXME: I don't think this is GC safe
            if (step.needs_unbox)
                body.push(`${valueKey} = mono_wasm_unbox_rooted (${valueKey});`);
            if (step.indirect) {
                const offsetText = `(indirectStart + ${indirectLocalOffset})`;
                switch (step.indirect) {
                    case "u32":
                        body.push(`setU32(${offsetText}, ${valueKey});`);
                        break;
                    case "i32":
                        body.push(`setI32(${offsetText}, ${valueKey});`);
                        break;
                    case "float":
                        body.push(`setF32(${offsetText}, ${valueKey});`);
                        break;
                    case "double":
                        body.push(`setF64(${offsetText}, ${valueKey});`);
                        break;
                    case "i64":
                        body.push(`setI64(${offsetText}, ${valueKey});`);
                        break;
                    default:
                        throw new Error("Unimplemented indirect type: " + step.indirect);
                }
                body.push(`setU32(buffer + (${i} * 4), ${offsetText});`);
                indirectLocalOffset += step.size;
            }
            else {
                body.push(`setI32(buffer + (${i} * 4), ${valueKey});`);
                indirectLocalOffset += 4;
            }
            body.push("");
        }
        body.push("return buffer;");
        let bodyJs = body.join("\r\n"), compiledFunction = null, compiledVariadicFunction = null;
        try {
            compiledFunction = _create_named_function("converter_" + converterName, argumentNames, bodyJs, closure);
            converter.compiled_function = compiledFunction;
        }
        catch (exc) {
            converter.compiled_function = null;
            console.warn("compiling converter failed for", bodyJs, "with error", exc);
            throw exc;
        }
        argumentNames = ["existingBuffer", "rootBuffer", "method", "args"];
        const variadicClosure = {
            converter: compiledFunction
        };
        body = [
            "return converter(",
            "  existingBuffer, rootBuffer, method,"
        ];
        for (let i = 0; i < converter.steps.length; i++) {
            body.push("  args[" + i +
                ((i == converter.steps.length - 1)
                    ? "]"
                    : "], "));
        }
        body.push(");");
        bodyJs = body.join("\r\n");
        try {
            compiledVariadicFunction = _create_named_function("variadic_converter_" + converterName, argumentNames, bodyJs, variadicClosure);
            converter.compiled_variadic_function = compiledVariadicFunction;
        }
        catch (exc) {
            converter.compiled_variadic_function = null;
            console.warn("compiling converter failed for", bodyJs, "with error", exc);
            throw exc;
        }
        converter.scratchRootBuffer = null;
        converter.scratchBuffer = VoidPtrNull;
        return converter;
    }
    function _maybe_produce_signature_warning(converter) {
        if (converter.has_warned_about_signature)
            return;
        console.warn("MONO_WASM: Deprecated raw return value signature: '" + converter.args_marshal + "'. End the signature with '!' instead of 'm'.");
        converter.has_warned_about_signature = true;
    }
    function _decide_if_result_is_marshaled(converter, argc) {
        if (!converter)
            return true;
        if (converter.is_result_possibly_unmarshaled &&
            (argc === converter.result_unmarshaled_if_argc)) {
            if (argc < converter.result_unmarshaled_if_argc)
                throw new Error(`Expected >= ${converter.result_unmarshaled_if_argc} argument(s) but got ${argc} for signature '${converter.args_marshal}'`);
            _maybe_produce_signature_warning(converter);
            return false;
        }
        else {
            if (argc < converter.steps.length)
                throw new Error(`Expected ${converter.steps.length} argument(s) but got ${argc} for signature '${converter.args_marshal}'`);
            return !converter.is_result_definitely_unmarshaled;
        }
    }
    function mono_bind_method(method, this_arg, args_marshal, friendly_name) {
        if (typeof (args_marshal) !== "string")
            throw new Error("args_marshal argument invalid, expected string");
        this_arg = coerceNull(this_arg);
        let converter = null;
        if (typeof (args_marshal) === "string") {
            converter = _compile_converter_for_marshal_string(args_marshal);
        }
        // FIXME
        const unbox_buffer_size = 8192;
        const unbox_buffer = Module._malloc(unbox_buffer_size);
        const token = {
            friendlyName: friendly_name,
            method,
            converter,
            scratchRootBuffer: null,
            scratchBuffer: VoidPtrNull,
            scratchResultRoot: mono_wasm_new_root(),
            scratchExceptionRoot: mono_wasm_new_root()
        };
        const closure = {
            Module,
            mono_wasm_new_root,
            _create_temp_frame,
            _get_args_root_buffer_for_method_call,
            _get_buffer_for_method_call,
            _handle_exception_for_call,
            _teardown_after_call,
            mono_wasm_try_unbox_primitive_and_get_type: wrapped_c_functions.mono_wasm_try_unbox_primitive_and_get_type,
            _unbox_mono_obj_root_with_known_nonprimitive_type,
            invoke_method: wrapped_c_functions.mono_wasm_invoke_method,
            method,
            this_arg,
            token,
            unbox_buffer,
            unbox_buffer_size,
            getI32,
            getU32,
            getF32,
            getF64
        };
        const converterKey = converter ? "converter_" + converter.name : "";
        if (converter)
            closure[converterKey] = converter;
        const argumentNames = [];
        const body = [
            "_create_temp_frame();",
            "let resultRoot = token.scratchResultRoot, exceptionRoot = token.scratchExceptionRoot;",
            "token.scratchResultRoot = null;",
            "token.scratchExceptionRoot = null;",
            "if (resultRoot === null)",
            "	resultRoot = mono_wasm_new_root ();",
            "if (exceptionRoot === null)",
            "	exceptionRoot = mono_wasm_new_root ();",
            ""
        ];
        if (converter) {
            body.push(`let argsRootBuffer = _get_args_root_buffer_for_method_call(${converterKey}, token);`, `let scratchBuffer = _get_buffer_for_method_call(${converterKey}, token);`, `let buffer = ${converterKey}.compiled_function(`, "    scratchBuffer, argsRootBuffer, method,");
            for (let i = 0; i < converter.steps.length; i++) {
                const argName = "arg" + i;
                argumentNames.push(argName);
                body.push("    " + argName +
                    ((i == converter.steps.length - 1)
                        ? ""
                        : ", "));
            }
            body.push(");");
        }
        else {
            body.push("let argsRootBuffer = null, buffer = 0;");
        }
        if (converter && converter.is_result_definitely_unmarshaled) {
            body.push("let is_result_marshaled = false;");
        }
        else if (converter && converter.is_result_possibly_unmarshaled) {
            body.push(`let is_result_marshaled = arguments.length !== ${converter.result_unmarshaled_if_argc};`);
        }
        else {
            body.push("let is_result_marshaled = true;");
        }
        // We inline a bunch of the invoke and marshaling logic here in order to eliminate the GC pressure normally
        //  created by the unboxing part of the call process. Because unbox_mono_obj(_root) can return non-numeric
        //  types, v8 and spidermonkey allocate and store its result on the heap (in the nursery, to be fair).
        // For a bound method however, we know the result will always be the same type because C# methods have known
        //  return types. Inlining the invoke and marshaling logic means that even though the bound method has logic
        //  for handling various types, only one path through the method (for its appropriate return type) will ever
        //  be taken, and the JIT will see that the 'result' local and thus the return value of this function are
        //  always of the exact same type. All of the branches related to this end up being predicted and low-cost.
        // The end result is that bound method invocations don't always allocate, so no more nursery GCs. Yay! -kg
        body.push("", "resultRoot.value = invoke_method (method, this_arg, buffer, exceptionRoot.get_address ());", `_handle_exception_for_call (${converterKey}, token, buffer, resultRoot, exceptionRoot, argsRootBuffer);`, "", "let resultPtr = resultRoot.value, result = undefined;");
        if (converter) {
            if (converter.is_result_possibly_unmarshaled)
                body.push("if (!is_result_marshaled) ");
            if (converter.is_result_definitely_unmarshaled || converter.is_result_possibly_unmarshaled)
                body.push("    result = resultPtr;");
            if (!converter.is_result_definitely_unmarshaled)
                body.push("if (is_result_marshaled && (resultPtr !== 0)) {", 
                // For the common scenario where the return type is a primitive, we want to try and unbox it directly
                //  into our existing heap allocation and then read it out of the heap. Doing this all in one operation
                //  means that we only need to enter a gc safe region twice (instead of 3+ times with the normal,
                //  slower check-type-and-then-unbox flow which has extra checks since unbox verifies the type).
                "    let resultType = mono_wasm_try_unbox_primitive_and_get_type (resultPtr, unbox_buffer, unbox_buffer_size);", "    switch (resultType) {", `    case ${MarshalType.INT}:`, "        result = getI32(unbox_buffer); break;", `    case ${MarshalType.POINTER}:`, // FIXME: Is this right?
                `    case ${MarshalType.UINT32}:`, "        result = getU32(unbox_buffer); break;", `    case ${MarshalType.FP32}:`, "        result = getF32(unbox_buffer); break;", `    case ${MarshalType.FP64}:`, "        result = getF64(unbox_buffer); break;", `    case ${MarshalType.BOOL}:`, "        result = getI32(unbox_buffer) !== 0; break;", `    case ${MarshalType.CHAR}:`, "        result = String.fromCharCode(getI32(unbox_buffer)); break;", "    default:", "        result = _unbox_mono_obj_root_with_known_nonprimitive_type (resultRoot, resultType, unbox_buffer); break;", "    }", "}");
        }
        else {
            throw new Error("No converter");
        }
        if (friendly_name) {
            const escapeRE = /[^A-Za-z0-9_$]/g;
            friendly_name = friendly_name.replace(escapeRE, "_");
        }
        let displayName = friendly_name || ("clr_" + method);
        if (this_arg)
            displayName += "_this" + this_arg;
        body.push(`_teardown_after_call (${converterKey}, token, buffer, resultRoot, exceptionRoot, argsRootBuffer);`, "return result;");
        const bodyJs = body.join("\r\n");
        const result = _create_named_function(displayName, argumentNames, bodyJs, closure);
        return result;
    }

    // Licensed to the .NET Foundation under one or more agreements.
    function _verify_args_for_method_call(args_marshal, args) {
        const has_args = args && (typeof args === "object") && args.length > 0;
        const has_args_marshal = typeof args_marshal === "string";
        if (has_args) {
            if (!has_args_marshal)
                throw new Error("No signature provided for method call.");
            else if (args.length > args_marshal.length)
                throw new Error("Too many parameter values. Expected at most " + args_marshal.length + " value(s) for signature " + args_marshal);
        }
        return has_args_marshal && has_args;
    }
    function _get_buffer_for_method_call(converter, token) {
        if (!converter)
            return VoidPtrNull;
        let result = VoidPtrNull;
        if (token !== null) {
            result = token.scratchBuffer || VoidPtrNull;
            token.scratchBuffer = VoidPtrNull;
        }
        else {
            result = converter.scratchBuffer || VoidPtrNull;
            converter.scratchBuffer = VoidPtrNull;
        }
        return result;
    }
    function _get_args_root_buffer_for_method_call(converter, token) {
        if (!converter)
            return undefined;
        if (!converter.needs_root_buffer)
            return undefined;
        let result = null;
        if (token !== null) {
            result = token.scratchRootBuffer;
            token.scratchRootBuffer = null;
        }
        else {
            result = converter.scratchRootBuffer;
            converter.scratchRootBuffer = null;
        }
        if (result === null) {
            // TODO: Expand the converter's heap allocation and then use
            //  mono_wasm_new_root_buffer_from_pointer instead. Not that important
            //  at present because the scratch buffer will be reused unless we are
            //  recursing through a re-entrant call
            result = mono_wasm_new_root_buffer(converter.steps.length);
            // FIXME
            result.converter = converter;
        }
        return result;
    }
    function _release_args_root_buffer_from_method_call(converter, token, argsRootBuffer) {
        if (!argsRootBuffer || !converter)
            return;
        // Store the arguments root buffer for re-use in later calls
        if (token && (token.scratchRootBuffer === null)) {
            argsRootBuffer.clear();
            token.scratchRootBuffer = argsRootBuffer;
        }
        else if (!converter.scratchRootBuffer) {
            argsRootBuffer.clear();
            converter.scratchRootBuffer = argsRootBuffer;
        }
        else {
            argsRootBuffer.release();
        }
    }
    function _release_buffer_from_method_call(converter, token, buffer) {
        if (!converter || !buffer)
            return;
        if (token && !token.scratchBuffer)
            token.scratchBuffer = buffer;
        else if (!converter.scratchBuffer)
            converter.scratchBuffer = coerceNull(buffer);
        else if (buffer)
            Module._free(buffer);
    }
    function _convert_exception_for_method_call(result, exception) {
        if (exception === MonoObjectNull)
            return null;
        const msg = conv_string(result);
        const err = new Error(msg); //the convention is that invoke_method ToString () any outgoing exception
        // console.warn (`error ${msg} at location ${err.stack});
        return err;
    }
    /*
    args_marshal is a string with one character per parameter that tells how to marshal it, here are the valid values:

    i: int32
    j: int32 - Enum with underlying type of int32
    l: int64
    k: int64 - Enum with underlying type of int64
    f: float
    d: double
    s: string
    S: interned string
    o: js object will be converted to a C# object (this will box numbers/bool/promises)
    m: raw mono object. Don't use it unless you know what you're doing

    to suppress marshaling of the return value, place '!' at the end of args_marshal, i.e. 'ii!' instead of 'ii'
    */
    function call_method(method, this_arg, args_marshal, args) {
        // HACK: Sometimes callers pass null or undefined, coerce it to 0 since that's what wasm expects
        this_arg = coerceNull(this_arg);
        // Detect someone accidentally passing the wrong type of value to method
        if (typeof method !== "number")
            throw new Error(`method must be an address in the native heap, but was '${method}'`);
        if (!method)
            throw new Error("no method specified");
        const needs_converter = _verify_args_for_method_call(args_marshal, args);
        let buffer = VoidPtrNull, converter = undefined, argsRootBuffer = undefined;
        let is_result_marshaled = true;
        // TODO: Only do this if the signature needs marshalling
        _create_temp_frame();
        // check if the method signature needs argument mashalling
        if (needs_converter) {
            converter = _compile_converter_for_marshal_string(args_marshal);
            is_result_marshaled = _decide_if_result_is_marshaled(converter, args.length);
            argsRootBuffer = _get_args_root_buffer_for_method_call(converter, null);
            const scratchBuffer = _get_buffer_for_method_call(converter, null);
            buffer = converter.compiled_variadic_function(scratchBuffer, argsRootBuffer, method, args);
        }
        return _call_method_with_converted_args(method, this_arg, converter, null, buffer, is_result_marshaled, argsRootBuffer);
    }
    function _handle_exception_for_call(converter, token, buffer, resultRoot, exceptionRoot, argsRootBuffer) {
        const exc = _convert_exception_for_method_call(resultRoot.value, exceptionRoot.value);
        if (!exc)
            return;
        _teardown_after_call(converter, token, buffer, resultRoot, exceptionRoot, argsRootBuffer);
        throw exc;
    }
    function _handle_exception_and_produce_result_for_call(converter, token, buffer, resultRoot, exceptionRoot, argsRootBuffer, is_result_marshaled) {
        _handle_exception_for_call(converter, token, buffer, resultRoot, exceptionRoot, argsRootBuffer);
        let result = resultRoot.value;
        if (is_result_marshaled)
            result = _unbox_mono_obj_root(resultRoot);
        _teardown_after_call(converter, token, buffer, resultRoot, exceptionRoot, argsRootBuffer);
        return result;
    }
    function _teardown_after_call(converter, token, buffer, resultRoot, exceptionRoot, argsRootBuffer) {
        _release_temp_frame();
        _release_args_root_buffer_from_method_call(converter, token, argsRootBuffer);
        _release_buffer_from_method_call(converter, token, buffer);
        if (resultRoot) {
            resultRoot.value = 0;
            if ((token !== null) && (token.scratchResultRoot === null))
                token.scratchResultRoot = resultRoot;
            else
                resultRoot.release();
        }
        if (exceptionRoot) {
            exceptionRoot.value = 0;
            if ((token !== null) && (token.scratchExceptionRoot === null))
                token.scratchExceptionRoot = exceptionRoot;
            else
                exceptionRoot.release();
        }
    }
    function _call_method_with_converted_args(method, this_arg, converter, token, buffer, is_result_marshaled, argsRootBuffer) {
        const resultRoot = mono_wasm_new_root(), exceptionRoot = mono_wasm_new_root();
        resultRoot.value = wrapped_c_functions.mono_wasm_invoke_method(method, this_arg, buffer, exceptionRoot.get_address());
        return _handle_exception_and_produce_result_for_call(converter, token, buffer, resultRoot, exceptionRoot, argsRootBuffer, is_result_marshaled);
    }
    function call_static_method(fqn, args, signature) {
        bindings_lazy_init(); // TODO remove this once Blazor does better startup
        const method = mono_method_resolve(fqn);
        if (typeof signature === "undefined")
            signature = mono_method_get_call_signature(method);
        return call_method(method, undefined, signature, args);
    }
    function mono_bind_static_method(fqn, signature) {
        bindings_lazy_init(); // TODO remove this once Blazor does better startup
        const method = mono_method_resolve(fqn);
        if (typeof signature === "undefined")
            signature = mono_method_get_call_signature(method);
        return mono_bind_method(method, null, signature, fqn);
    }
    function mono_bind_assembly_entry_point(assembly, signature) {
        bindings_lazy_init(); // TODO remove this once Blazor does better startup
        const asm = wrapped_c_functions.mono_wasm_assembly_load(assembly);
        if (!asm)
            throw new Error("Could not find assembly: " + assembly);
        const method = wrapped_c_functions.mono_wasm_assembly_get_entry_point(asm);
        if (!method)
            throw new Error("Could not find entry point for assembly: " + assembly);
        if (typeof signature === "undefined")
            signature = mono_method_get_call_signature(method);
        return function (...args) {
            try {
                if (args.length > 0 && Array.isArray(args[0]))
                    args[0] = js_array_to_mono_array(args[0], true, false);
                const result = call_method(method, undefined, signature, args);
                return Promise.resolve(result);
            }
            catch (error) {
                return Promise.reject(error);
            }
        };
    }
    function mono_call_assembly_entry_point(assembly, args, signature) {
        return mono_bind_assembly_entry_point(assembly, signature)(...args);
    }
    function mono_wasm_invoke_js_with_args(js_handle, method_name, args, is_exception) {
        const argsRoot = mono_wasm_new_root(args), nameRoot = mono_wasm_new_root(method_name);
        try {
            const js_name = conv_string(nameRoot.value);
            if (!js_name || (typeof (js_name) !== "string")) {
                return wrap_error(is_exception, "ERR12: Invalid method name object '" + nameRoot.value + "'");
            }
            const obj = get_js_obj(js_handle);
            if (!obj) {
                return wrap_error(is_exception, "ERR13: Invalid JS object handle '" + js_handle + "' while invoking '" + js_name + "'");
            }
            const js_args = _mono_array_root_to_js_array(argsRoot);
            try {
                const m = obj[js_name];
                if (typeof m === "undefined")
                    throw new Error("Method: '" + js_name + "' not found for: '" + Object.prototype.toString.call(obj) + "'");
                const res = m.apply(obj, js_args);
                return _js_to_mono_obj(true, res);
            }
            catch (ex) {
                return wrap_error(is_exception, ex);
            }
        }
        finally {
            argsRoot.release();
            nameRoot.release();
        }
    }
    function mono_wasm_get_object_property(js_handle, property_name, is_exception) {
        const nameRoot = mono_wasm_new_root(property_name);
        try {
            const js_name = conv_string(nameRoot.value);
            if (!js_name) {
                return wrap_error(is_exception, "Invalid property name object '" + nameRoot.value + "'");
            }
            const obj = mono_wasm_get_jsobj_from_js_handle(js_handle);
            if (!obj) {
                return wrap_error(is_exception, "ERR01: Invalid JS object handle '" + js_handle + "' while geting '" + js_name + "'");
            }
            try {
                const m = obj[js_name];
                return _js_to_mono_obj(true, m);
            }
            catch (ex) {
                return wrap_error(is_exception, ex);
            }
        }
        finally {
            nameRoot.release();
        }
    }
    function mono_wasm_set_object_property(js_handle, property_name, value, createIfNotExist, hasOwnProperty, is_exception) {
        const valueRoot = mono_wasm_new_root(value), nameRoot = mono_wasm_new_root(property_name);
        try {
            const property = conv_string(nameRoot.value);
            if (!property) {
                return wrap_error(is_exception, "Invalid property name object '" + property_name + "'");
            }
            const js_obj = mono_wasm_get_jsobj_from_js_handle(js_handle);
            if (!js_obj) {
                return wrap_error(is_exception, "ERR02: Invalid JS object handle '" + js_handle + "' while setting '" + property + "'");
            }
            let result = false;
            const js_value = _unbox_mono_obj_root(valueRoot);
            if (createIfNotExist) {
                js_obj[property] = js_value;
                result = true;
            }
            else {
                result = false;
                if (!createIfNotExist) {
                    if (!Object.prototype.hasOwnProperty.call(js_obj, property))
                        return _box_js_bool(false);
                }
                if (hasOwnProperty === true) {
                    if (Object.prototype.hasOwnProperty.call(js_obj, property)) {
                        js_obj[property] = js_value;
                        result = true;
                    }
                }
                else {
                    js_obj[property] = js_value;
                    result = true;
                }
            }
            return _box_js_bool(result);
        }
        finally {
            nameRoot.release();
            valueRoot.release();
        }
    }
    function mono_wasm_get_by_index(js_handle, property_index, is_exception) {
        const obj = mono_wasm_get_jsobj_from_js_handle(js_handle);
        if (!obj) {
            return wrap_error(is_exception, "ERR03: Invalid JS object handle '" + js_handle + "' while getting [" + property_index + "]");
        }
        try {
            const m = obj[property_index];
            return _js_to_mono_obj(true, m);
        }
        catch (ex) {
            return wrap_error(is_exception, ex);
        }
    }
    function mono_wasm_set_by_index(js_handle, property_index, value, is_exception) {
        const valueRoot = mono_wasm_new_root(value);
        try {
            const obj = mono_wasm_get_jsobj_from_js_handle(js_handle);
            if (!obj) {
                return wrap_error(is_exception, "ERR04: Invalid JS object handle '" + js_handle + "' while setting [" + property_index + "]");
            }
            const js_value = _unbox_mono_obj_root(valueRoot);
            try {
                obj[property_index] = js_value;
                return true; // TODO check
            }
            catch (ex) {
                return wrap_error(is_exception, ex);
            }
        }
        finally {
            valueRoot.release();
        }
    }
    function mono_wasm_get_global_object(global_name, is_exception) {
        const nameRoot = mono_wasm_new_root(global_name);
        try {
            const js_name = conv_string(nameRoot.value);
            let globalObj;
            if (!js_name) {
                globalObj = globalThis;
            }
            else {
                globalObj = globalThis[js_name];
            }
            // TODO returning null may be useful when probing for browser features
            if (globalObj === null || typeof globalObj === undefined) {
                return wrap_error(is_exception, "Global object '" + js_name + "' not found.");
            }
            return _js_to_mono_obj(true, globalObj);
        }
        finally {
            nameRoot.release();
        }
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function wrap_error(is_exception, ex) {
        let res = "unknown exception";
        if (ex) {
            res = ex.toString();
            const stack = ex.stack;
            if (stack) {
                // Some JS runtimes insert the error message at the top of the stack, some don't,
                //  so normalize it by using the stack as the result if it already contains the error
                if (stack.startsWith(res))
                    res = stack;
                else
                    res += "\n" + stack;
            }
        }
        if (is_exception) {
            Module.setValue(is_exception, 1, "i32");
        }
        return js_string_to_mono_string(res);
    }
    function mono_method_get_call_signature(method, mono_obj) {
        const instanceRoot = mono_wasm_new_root(mono_obj);
        try {
            return call_method(runtimeHelpers.get_call_sig, undefined, "im", [method, instanceRoot.value]);
        }
        finally {
            instanceRoot.release();
        }
    }
    function mono_method_resolve(fqn) {
        const assembly = fqn.substring(fqn.indexOf("[") + 1, fqn.indexOf("]")).trim();
        fqn = fqn.substring(fqn.indexOf("]") + 1).trim();
        const methodname = fqn.substring(fqn.indexOf(":") + 1);
        fqn = fqn.substring(0, fqn.indexOf(":")).trim();
        let namespace = "";
        let classname = fqn;
        if (fqn.indexOf(".") != -1) {
            const idx = fqn.lastIndexOf(".");
            namespace = fqn.substring(0, idx);
            classname = fqn.substring(idx + 1);
        }
        if (!assembly.trim())
            throw new Error("No assembly name specified");
        if (!classname.trim())
            throw new Error("No class name specified");
        if (!methodname.trim())
            throw new Error("No method name specified");
        const asm = wrapped_c_functions.mono_wasm_assembly_load(assembly);
        if (!asm)
            throw new Error("Could not find assembly: " + assembly);
        const klass = wrapped_c_functions.mono_wasm_assembly_find_class(asm, namespace, classname);
        if (!klass)
            throw new Error("Could not find class: " + namespace + ":" + classname + " in assembly " + assembly);
        const method = find_method(klass, methodname, -1);
        if (!method)
            throw new Error("Could not find method: " + methodname);
        return method;
    }
    // Blazor specific custom routine
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function mono_wasm_invoke_js_blazor(exceptionMessage, callInfo, arg0, arg1, arg2) {
        try {
            const blazorExports = globalThis.Blazor;
            if (!blazorExports) {
                throw new Error("The blazor.webassembly.js library is not loaded.");
            }
            return blazorExports._internal.invokeJSFromDotNet(callInfo, arg0, arg1, arg2);
        }
        catch (ex) {
            const exceptionJsString = ex.message + "\n" + ex.stack;
            const exceptionSystemString = wrapped_c_functions.mono_wasm_string_from_js(exceptionJsString);
            Module.setValue(exceptionMessage, exceptionSystemString, "i32"); // *exceptionMessage = exceptionSystemString;
            return 0;
        }
    }
    // code like `App.call_test_method();`
    function mono_wasm_invoke_js(code, is_exception) {
        if (code === MonoStringNull)
            return MonoStringNull;
        const js_code = conv_string(code);
        try {
            const closedEval = function (Module, MONO, BINDING, INTERNAL, code) {
                return eval(code);
            };
            const res = closedEval(Module, MONO$1, BINDING$1, INTERNAL$1, js_code);
            Module.setValue(is_exception, 0, "i32");
            if (typeof res === "undefined" || res === null)
                return MonoStringNull;
            return js_string_to_mono_string(res.toString());
        }
        catch (ex) {
            return wrap_error(is_exception, ex);
        }
    }
    // TODO is this unused code ?
    // Compiles a JavaScript function from the function data passed.
    // Note: code snippet is not a function definition. Instead it must create and return a function instance.
    // code like `return function() { App.call_test_method(); };`
    function mono_wasm_compile_function(code, is_exception) {
        if (code === MonoStringNull)
            return MonoStringNull;
        const js_code = conv_string(code);
        try {
            const closure = {
                Module, MONO: MONO$1, BINDING: BINDING$1, INTERNAL: INTERNAL$1
            };
            const fn_body_template = `const {Module, MONO, BINDING, INTERNAL} = __closure; ${js_code} ;`;
            const fn_defn = new Function("__closure", fn_body_template);
            const res = fn_defn(closure);
            if (!res || typeof res !== "function")
                return wrap_error(is_exception, "Code must return an instance of a JavaScript function. Please use `return` statement to return a function.");
            Module.setValue(is_exception, 0, "i32");
            return _js_to_mono_obj(true, res);
        }
        catch (ex) {
            return wrap_error(is_exception, ex);
        }
    }

    // Licensed to the .NET Foundation under one or more agreements.
    // Creates a new typed array from pinned array address from pinned_array allocated on the heap to the typed array.
    // 	 adress of managed pinned array -> copy from heap -> typed array memory
    function typed_array_from(pinned_array, begin, end, bytes_per_element, type) {
        // typed array
        let newTypedArray = null;
        switch (type) {
            case 5:
                newTypedArray = new Int8Array(end - begin);
                break;
            case 6:
                newTypedArray = new Uint8Array(end - begin);
                break;
            case 7:
                newTypedArray = new Int16Array(end - begin);
                break;
            case 8:
                newTypedArray = new Uint16Array(end - begin);
                break;
            case 9:
                newTypedArray = new Int32Array(end - begin);
                break;
            case 10:
                newTypedArray = new Uint32Array(end - begin);
                break;
            case 13:
                newTypedArray = new Float32Array(end - begin);
                break;
            case 14:
                newTypedArray = new Float64Array(end - begin);
                break;
            case 15: // This is a special case because the typed array is also byte[]
                newTypedArray = new Uint8ClampedArray(end - begin);
                break;
            default:
                throw new Error("Unknown array type " + type);
        }
        typedarray_copy_from(newTypedArray, pinned_array, begin, end, bytes_per_element);
        return newTypedArray;
    }
    // Copy the existing typed array to the heap pointed to by the pinned array address
    // 	 typed array memory -> copy to heap -> address of managed pinned array
    function typedarray_copy_to(typed_array, pinned_array, begin, end, bytes_per_element) {
        // JavaScript typed arrays are array-like objects and provide a mechanism for accessing
        // raw binary data. (...) To achieve maximum flexibility and efficiency, JavaScript typed arrays
        // split the implementation into buffers and views. A buffer (implemented by the ArrayBuffer object)
        //  is an object representing a chunk of data; it has no format to speak of, and offers no
        // mechanism for accessing its contents. In order to access the memory contained in a buffer,
        // you need to use a view. A view provides a context — that is, a data type, starting offset,
        // and number of elements — that turns the data into an actual typed array.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
        if (has_backing_array_buffer(typed_array) && typed_array.BYTES_PER_ELEMENT) {
            // Some sanity checks of what is being asked of us
            // lets play it safe and throw an error here instead of assuming to much.
            // Better safe than sorry later
            if (bytes_per_element !== typed_array.BYTES_PER_ELEMENT)
                throw new Error("Inconsistent element sizes: TypedArray.BYTES_PER_ELEMENT '" + typed_array.BYTES_PER_ELEMENT + "' sizeof managed element: '" + bytes_per_element + "'");
            // how much space we have to work with
            let num_of_bytes = (end - begin) * bytes_per_element;
            // how much typed buffer space are we talking about
            const view_bytes = typed_array.length * typed_array.BYTES_PER_ELEMENT;
            // only use what is needed.
            if (num_of_bytes > view_bytes)
                num_of_bytes = view_bytes;
            // offset index into the view
            const offset = begin * bytes_per_element;
            // Create a view over the heap pointed to by the pinned array address
            const heapBytes = new Uint8Array(Module.HEAPU8.buffer, pinned_array + offset, num_of_bytes);
            // Copy the bytes of the typed array to the heap.
            heapBytes.set(new Uint8Array(typed_array.buffer, typed_array.byteOffset, num_of_bytes));
            return num_of_bytes;
        }
        else {
            throw new Error("Object '" + typed_array + "' is not a typed array");
        }
    }
    // Copy the pinned array address from pinned_array allocated on the heap to the typed array.
    // 	 adress of managed pinned array -> copy from heap -> typed array memory
    function typedarray_copy_from(typed_array, pinned_array, begin, end, bytes_per_element) {
        // JavaScript typed arrays are array-like objects and provide a mechanism for accessing
        // raw binary data. (...) To achieve maximum flexibility and efficiency, JavaScript typed arrays
        // split the implementation into buffers and views. A buffer (implemented by the ArrayBuffer object)
        //  is an object representing a chunk of data; it has no format to speak of, and offers no
        // mechanism for accessing its contents. In order to access the memory contained in a buffer,
        // you need to use a view. A view provides a context — that is, a data type, starting offset,
        // and number of elements — that turns the data into an actual typed array.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
        if (has_backing_array_buffer(typed_array) && typed_array.BYTES_PER_ELEMENT) {
            // Some sanity checks of what is being asked of us
            // lets play it safe and throw an error here instead of assuming to much.
            // Better safe than sorry later
            if (bytes_per_element !== typed_array.BYTES_PER_ELEMENT)
                throw new Error("Inconsistent element sizes: TypedArray.BYTES_PER_ELEMENT '" + typed_array.BYTES_PER_ELEMENT + "' sizeof managed element: '" + bytes_per_element + "'");
            // how much space we have to work with
            let num_of_bytes = (end - begin) * bytes_per_element;
            // how much typed buffer space are we talking about
            const view_bytes = typed_array.length * typed_array.BYTES_PER_ELEMENT;
            // only use what is needed.
            if (num_of_bytes > view_bytes)
                num_of_bytes = view_bytes;
            // Create a new view for mapping
            const typedarrayBytes = new Uint8Array(typed_array.buffer, 0, num_of_bytes);
            // offset index into the view
            const offset = begin * bytes_per_element;
            // Set view bytes to value from HEAPU8
            typedarrayBytes.set(Module.HEAPU8.subarray(pinned_array + offset, pinned_array + offset + num_of_bytes));
            return num_of_bytes;
        }
        else {
            throw new Error("Object '" + typed_array + "' is not a typed array");
        }
    }
    function mono_wasm_typed_array_copy_to(js_handle, pinned_array, begin, end, bytes_per_element, is_exception) {
        const js_obj = mono_wasm_get_jsobj_from_js_handle(js_handle);
        if (!js_obj) {
            return wrap_error(is_exception, "ERR07: Invalid JS object handle '" + js_handle + "'");
        }
        const res = typedarray_copy_to(js_obj, pinned_array, begin, end, bytes_per_element);
        // returns num_of_bytes boxed
        return _js_to_mono_obj(false, res);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function mono_wasm_typed_array_from(pinned_array, begin, end, bytes_per_element, type, is_exception) {
        const res = typed_array_from(pinned_array, begin, end, bytes_per_element, type);
        // returns JS typed array like Int8Array, to be wraped with JSObject proxy
        return _js_to_mono_obj(true, res);
    }
    function mono_wasm_typed_array_copy_from(js_handle, pinned_array, begin, end, bytes_per_element, is_exception) {
        const js_obj = mono_wasm_get_jsobj_from_js_handle(js_handle);
        if (!js_obj) {
            return wrap_error(is_exception, "ERR08: Invalid JS object handle '" + js_handle + "'");
        }
        const res = typedarray_copy_from(js_obj, pinned_array, begin, end, bytes_per_element);
        // returns num_of_bytes boxed
        return _js_to_mono_obj(false, res);
    }
    function has_backing_array_buffer(js_obj) {
        return typeof SharedArrayBuffer !== "undefined"
            ? js_obj.buffer instanceof ArrayBuffer || js_obj.buffer instanceof SharedArrayBuffer
            : js_obj.buffer instanceof ArrayBuffer;
    }
    // @bytes must be a typed array. space is allocated for it in the native heap
    //  and it is copied to that location. returns the address of the allocation.
    function mono_wasm_load_bytes_into_heap(bytes) {
        const memoryOffset = Module._malloc(bytes.length);
        const heapBytes = new Uint8Array(Module.HEAPU8.buffer, memoryOffset, bytes.length);
        heapBytes.set(bytes);
        return memoryOffset;
    }

    const _assembly_cache_by_name = new Map();
    const _class_cache_by_assembly = new Map();
    let _corlib = MonoAssemblyNull;
    function assembly_load(name) {
        if (_assembly_cache_by_name.has(name))
            return _assembly_cache_by_name.get(name);
        const result = wrapped_c_functions.mono_wasm_assembly_load(name);
        _assembly_cache_by_name.set(name, result);
        return result;
    }
    function _find_cached_class(assembly, namespace, name) {
        let namespaces = _class_cache_by_assembly.get(assembly);
        if (!namespaces)
            _class_cache_by_assembly.set(assembly, namespaces = new Map());
        let classes = namespaces.get(namespace);
        if (!classes) {
            classes = new Map();
            namespaces.set(namespace, classes);
        }
        return classes.get(name);
    }
    function _set_cached_class(assembly, namespace, name, ptr) {
        const namespaces = _class_cache_by_assembly.get(assembly);
        if (!namespaces)
            throw new Error("internal error");
        const classes = namespaces.get(namespace);
        if (!classes)
            throw new Error("internal error");
        classes.set(name, ptr);
    }
    function find_corlib_class(namespace, name, throw_on_failure) {
        if (!_corlib)
            _corlib = wrapped_c_functions.mono_wasm_get_corlib();
        let result = _find_cached_class(_corlib, namespace, name);
        if (result !== undefined)
            return result;
        result = wrapped_c_functions.mono_wasm_assembly_find_class(_corlib, namespace, name);
        if (throw_on_failure && !result)
            throw new Error(`Failed to find corlib class ${namespace}.${name}`);
        _set_cached_class(_corlib, namespace, name, result);
        return result;
    }
    function find_class_in_assembly(assembly_name, namespace, name, throw_on_failure) {
        const assembly = wrapped_c_functions.mono_wasm_assembly_load(assembly_name);
        let result = _find_cached_class(assembly, namespace, name);
        if (result !== undefined)
            return result;
        result = wrapped_c_functions.mono_wasm_assembly_find_class(assembly, namespace, name);
        if (throw_on_failure && !result)
            throw new Error(`Failed to find class ${namespace}.${name} in ${assembly_name}`);
        _set_cached_class(assembly, namespace, name, result);
        return result;
    }
    function find_corlib_type(namespace, name, throw_on_failure) {
        const classPtr = find_corlib_class(namespace, name, throw_on_failure);
        if (!classPtr)
            return MonoTypeNull;
        return wrapped_c_functions.mono_wasm_class_get_type(classPtr);
    }
    function find_type_in_assembly(assembly_name, namespace, name, throw_on_failure) {
        const classPtr = find_class_in_assembly(assembly_name, namespace, name, throw_on_failure);
        if (!classPtr)
            return MonoTypeNull;
        return wrapped_c_functions.mono_wasm_class_get_type(classPtr);
    }

    // Licensed to the .NET Foundation under one or more agreements.
    let runtime_is_initialized_resolve;
    let runtime_is_initialized_reject;
    const mono_wasm_runtime_is_initialized = new Promise((resolve, reject) => {
        runtime_is_initialized_resolve = resolve;
        runtime_is_initialized_reject = reject;
    });
    async function mono_wasm_pre_init() {
        const moduleExt = Module;
        if (moduleExt.configSrc) {
            try {
                // sets MONO.config implicitly
                await mono_wasm_load_config(moduleExt.configSrc);
            }
            catch (err) {
                runtime_is_initialized_reject(err);
                throw err;
            }
            if (moduleExt.onConfigLoaded) {
                try {
                    moduleExt.onConfigLoaded();
                }
                catch (err) {
                    Module.printErr("MONO_WASM: onConfigLoaded () failed: " + err);
                    Module.printErr("MONO_WASM: Stacktrace: \n");
                    Module.printErr(err.stack);
                    runtime_is_initialized_reject(err);
                    throw err;
                }
            }
        }
    }
    function mono_wasm_on_runtime_initialized() {
        const moduleExt = Module;
        if (!moduleExt.config || moduleExt.config.isError) {
            return;
        }
        mono_load_runtime_and_bcl_args(moduleExt.config);
    }
    // Set environment variable NAME to VALUE
    // Should be called before mono_load_runtime_and_bcl () in most cases
    function mono_wasm_setenv(name, value) {
        wrapped_c_functions.mono_wasm_setenv(name, value);
    }
    function mono_wasm_set_runtime_options(options) {
        const argv = Module._malloc(options.length * 4);
        let aindex = 0;
        for (let i = 0; i < options.length; ++i) {
            Module.setValue(argv + (aindex * 4), wrapped_c_functions.mono_wasm_strdup(options[i]), "i32");
            aindex += 1;
        }
        wrapped_c_functions.mono_wasm_parse_runtime_options(options.length, argv);
    }
    async function _fetch_asset(url) {
        try {
            if (typeof (fetch) === "function") {
                return fetch(url, { credentials: "same-origin" });
            }
            else if (ENVIRONMENT_IS_NODE) {
                //const fs = (<any>globalThis).require("fs");
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const fs = require("fs");
                const arrayBuffer = await fs.promises.readFile(url);
                return {
                    ok: true,
                    url,
                    arrayBuffer: () => arrayBuffer,
                    json: () => JSON.parse(arrayBuffer)
                };
            }
            else if (typeof (read) === "function") {
                const arrayBuffer = new Uint8Array(read(url, "binary"));
                return {
                    ok: true,
                    url,
                    arrayBuffer: () => arrayBuffer,
                    json: () => JSON.parse(Module.UTF8ArrayToString(arrayBuffer, 0, arrayBuffer.length))
                };
            }
        }
        catch (e) {
            return {
                ok: false,
                url,
                arrayBuffer: () => { throw e; },
                json: () => { throw e; }
            };
        }
        throw new Error("No fetch implementation available");
    }
    function _handle_fetched_asset(ctx, asset, url, blob) {
        const bytes = new Uint8Array(blob);
        if (ctx.tracing)
            console.log(`MONO_WASM: Loaded:${asset.name} as ${asset.behavior} size ${bytes.length} from ${url}`);
        const virtualName = asset.virtual_path || asset.name;
        let offset = null;
        switch (asset.behavior) {
            case "resource":
            case "assembly":
                ctx.loaded_files.push({ url: url, file: virtualName });
            // falls through
            case "heap":
            case "icu":
                offset = mono_wasm_load_bytes_into_heap(bytes);
                ctx.loaded_assets[virtualName] = [offset, bytes.length];
                break;
            case "vfs": {
                // FIXME
                const lastSlash = virtualName.lastIndexOf("/");
                let parentDirectory = (lastSlash > 0)
                    ? virtualName.substr(0, lastSlash)
                    : null;
                let fileName = (lastSlash > 0)
                    ? virtualName.substr(lastSlash + 1)
                    : virtualName;
                if (fileName.startsWith("/"))
                    fileName = fileName.substr(1);
                if (parentDirectory) {
                    if (ctx.tracing)
                        console.log(`MONO_WASM: Creating directory '${parentDirectory}'`);
                    ctx.createPath("/", parentDirectory, true, true // fixme: should canWrite be false?
                    );
                }
                else {
                    parentDirectory = "/";
                }
                if (ctx.tracing)
                    console.log(`MONO_WASM: Creating file '${fileName}' in directory '${parentDirectory}'`);
                if (!mono_wasm_load_data_archive(bytes, parentDirectory)) {
                    ctx.createDataFile(parentDirectory, fileName, bytes, true /* canRead */, true /* canWrite */, true /* canOwn */);
                }
                break;
            }
            default:
                throw new Error(`Unrecognized asset behavior:${asset.behavior}, for asset ${asset.name}`);
        }
        if (asset.behavior === "assembly") {
            const hasPpdb = wrapped_c_functions.mono_wasm_add_assembly(virtualName, offset, bytes.length);
            if (!hasPpdb) {
                const index = ctx.loaded_files.findIndex(element => element.file == virtualName);
                ctx.loaded_files.splice(index, 1);
            }
        }
        else if (asset.behavior === "icu") {
            if (!mono_wasm_load_icu_data(offset))
                console.error(`MONO_WASM: Error loading ICU asset ${asset.name}`);
        }
        else if (asset.behavior === "resource") {
            wrapped_c_functions.mono_wasm_add_satellite_assembly(virtualName, asset.culture, offset, bytes.length);
        }
    }
    function _apply_configuration_from_args(args) {
        for (const k in (args.environment_variables || {}))
            mono_wasm_setenv(k, args.environment_variables[k]);
        if (args.runtime_options)
            mono_wasm_set_runtime_options(args.runtime_options);
        if (args.aot_profiler_options)
            mono_wasm_init_aot_profiler(args.aot_profiler_options);
        if (args.coverage_profiler_options)
            mono_wasm_init_coverage_profiler(args.coverage_profiler_options);
    }
    function _finalize_startup(args, ctx) {
        const moduleExt = Module;
        ctx.loaded_files.forEach(value => MONO$1.loaded_files.push(value.url));
        if (ctx.tracing) {
            console.log("MONO_WASM: loaded_assets: " + JSON.stringify(ctx.loaded_assets));
            console.log("MONO_WASM: loaded_files: " + JSON.stringify(ctx.loaded_files));
        }
        console.debug("MONO_WASM: Initializing mono runtime");
        mono_wasm_globalization_init(args.globalization_mode);
        if (ENVIRONMENT_IS_SHELL || ENVIRONMENT_IS_NODE) {
            try {
                wrapped_c_functions.mono_wasm_load_runtime("unused", args.debug_level || 0);
            }
            catch (err) {
                Module.printErr("MONO_WASM: mono_wasm_load_runtime () failed: " + err);
                Module.printErr("MONO_WASM: Stacktrace: \n");
                Module.printErr(err.stack);
                runtime_is_initialized_reject(err);
                const wasm_exit = wrapped_c_functions.mono_wasm_exit;
                wasm_exit(1);
            }
        }
        else {
            wrapped_c_functions.mono_wasm_load_runtime("unused", args.debug_level || 0);
        }
        bindings_lazy_init();
        let tz;
        try {
            tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        catch (_a) {
            //swallow
        }
        mono_wasm_setenv("TZ", tz || "UTC");
        mono_wasm_runtime_ready();
        //legacy config loading
        const argsAny = args;
        if (argsAny.loaded_cb) {
            try {
                argsAny.loaded_cb();
            }
            catch (err) {
                Module.printErr("MONO_WASM: loaded_cb () failed: " + err);
                Module.printErr("MONO_WASM: Stacktrace: \n");
                Module.printErr(err.stack);
                runtime_is_initialized_reject(err);
                throw err;
            }
        }
        if (moduleExt.onDotNetReady) {
            try {
                moduleExt.onDotNetReady();
            }
            catch (err) {
                Module.printErr("MONO_WASM: onDotNetReady () failed: " + err);
                Module.printErr("MONO_WASM: Stacktrace: \n");
                Module.printErr(err.stack);
                runtime_is_initialized_reject(err);
                throw err;
            }
        }
        runtime_is_initialized_resolve();
    }
    function bindings_lazy_init() {
        if (runtimeHelpers.mono_wasm_bindings_is_ready)
            return;
        runtimeHelpers.mono_wasm_bindings_is_ready = true;
        // please keep System.Runtime.InteropServices.JavaScript.Runtime.MappedType in sync
        Object.prototype[wasm_type_symbol] = 0;
        Array.prototype[wasm_type_symbol] = 1;
        ArrayBuffer.prototype[wasm_type_symbol] = 2;
        DataView.prototype[wasm_type_symbol] = 3;
        Function.prototype[wasm_type_symbol] = 4;
        Map.prototype[wasm_type_symbol] = 5;
        if (typeof SharedArrayBuffer !== "undefined")
            SharedArrayBuffer.prototype[wasm_type_symbol] = 6;
        Int8Array.prototype[wasm_type_symbol] = 10;
        Uint8Array.prototype[wasm_type_symbol] = 11;
        Uint8ClampedArray.prototype[wasm_type_symbol] = 12;
        Int16Array.prototype[wasm_type_symbol] = 13;
        Uint16Array.prototype[wasm_type_symbol] = 14;
        Int32Array.prototype[wasm_type_symbol] = 15;
        Uint32Array.prototype[wasm_type_symbol] = 16;
        Float32Array.prototype[wasm_type_symbol] = 17;
        Float64Array.prototype[wasm_type_symbol] = 18;
        runtimeHelpers._box_buffer_size = 65536;
        runtimeHelpers._unbox_buffer_size = 65536;
        runtimeHelpers._box_buffer = Module._malloc(runtimeHelpers._box_buffer_size);
        runtimeHelpers._unbox_buffer = Module._malloc(runtimeHelpers._unbox_buffer_size);
        runtimeHelpers._class_int32 = find_corlib_class("System", "Int32");
        runtimeHelpers._class_uint32 = find_corlib_class("System", "UInt32");
        runtimeHelpers._class_double = find_corlib_class("System", "Double");
        runtimeHelpers._class_boolean = find_corlib_class("System", "Boolean");
        runtimeHelpers.bind_runtime_method = bind_runtime_method;
        const bindingAssembly = INTERNAL$1.BINDING_ASM;
        const binding_fqn_asm = bindingAssembly.substring(bindingAssembly.indexOf("[") + 1, bindingAssembly.indexOf("]")).trim();
        const binding_fqn_class = bindingAssembly.substring(bindingAssembly.indexOf("]") + 1).trim();
        const binding_module = wrapped_c_functions.mono_wasm_assembly_load(binding_fqn_asm);
        if (!binding_module)
            throw "Can't find bindings module assembly: " + binding_fqn_asm;
        if (binding_fqn_class && binding_fqn_class.length) {
            runtimeHelpers.runtime_classname = binding_fqn_class;
            if (binding_fqn_class.indexOf(".") != -1) {
                const idx = binding_fqn_class.lastIndexOf(".");
                runtimeHelpers.runtime_namespace = binding_fqn_class.substring(0, idx);
                runtimeHelpers.runtime_classname = binding_fqn_class.substring(idx + 1);
            }
        }
        runtimeHelpers.wasm_runtime_class = wrapped_c_functions.mono_wasm_assembly_find_class(binding_module, runtimeHelpers.runtime_namespace, runtimeHelpers.runtime_classname);
        if (!runtimeHelpers.wasm_runtime_class)
            throw "Can't find " + binding_fqn_class + " class";
        runtimeHelpers.get_call_sig = get_method("GetCallSignature");
        if (!runtimeHelpers.get_call_sig)
            throw "Can't find GetCallSignature method";
        _create_primitive_converters();
    }
    // Initializes the runtime and loads assemblies, debug information, and other files.
    async function mono_load_runtime_and_bcl_args(args) {
        try {
            if (args.enable_debugging)
                args.debug_level = args.enable_debugging;
            const ctx = {
                tracing: args.diagnostic_tracing || false,
                pending_count: args.assets.length,
                loaded_assets: Object.create(null),
                // dlls and pdbs, used by blazor and the debugger
                loaded_files: [],
                createPath: Module.FS_createPath,
                createDataFile: Module.FS_createDataFile
            };
            _apply_configuration_from_args(args);
            const local_fetch = typeof (args.fetch_file_cb) === "function" ? args.fetch_file_cb : _fetch_asset;
            const load_asset = async (asset) => {
                //TODO we could do module.addRunDependency(asset.name) and delay emscripten run() after all assets are loaded
                const sourcesList = asset.load_remote ? args.remote_sources : [""];
                let error = undefined;
                for (let sourcePrefix of sourcesList) {
                    // HACK: Special-case because MSBuild doesn't allow "" as an attribute
                    if (sourcePrefix === "./")
                        sourcePrefix = "";
                    let attemptUrl;
                    if (sourcePrefix.trim() === "") {
                        if (asset.behavior === "assembly")
                            attemptUrl = locateFile(args.assembly_root + "/" + asset.name);
                        else if (asset.behavior === "resource") {
                            const path = asset.culture !== "" ? `${asset.culture}/${asset.name}` : asset.name;
                            attemptUrl = locateFile(args.assembly_root + "/" + path);
                        }
                        else
                            attemptUrl = asset.name;
                    }
                    else {
                        attemptUrl = sourcePrefix + asset.name;
                    }
                    if (asset.name === attemptUrl) {
                        if (ctx.tracing)
                            console.log(`MONO_WASM: Attempting to fetch '${attemptUrl}'`);
                    }
                    else {
                        if (ctx.tracing)
                            console.log(`MONO_WASM: Attempting to fetch '${attemptUrl}' for ${asset.name}`);
                    }
                    try {
                        const response = await local_fetch(attemptUrl);
                        if (!response.ok) {
                            error = new Error(`MONO_WASM: Fetch '${attemptUrl}' for ${asset.name} failed ${response.status} ${response.statusText}`);
                            continue; // next source
                        }
                        const buffer = await response.arrayBuffer();
                        _handle_fetched_asset(ctx, asset, attemptUrl, buffer);
                        --ctx.pending_count;
                        error = undefined;
                    }
                    catch (err) {
                        error = new Error(`MONO_WASM: Fetch '${attemptUrl}' for ${asset.name} failed ${err}`);
                        continue; //next source
                    }
                    if (!error) {
                        //TODO Module.removeRunDependency(configFilePath);
                        break; // this source worked, stop searching
                    }
                }
                if (error) {
                    const isOkToFail = asset.is_optional || (asset.name.match(/\.pdb$/) && args.ignore_pdb_load_errors);
                    if (!isOkToFail)
                        throw error;
                }
            };
            const fetch_promises = [];
            // start fetching all assets in parallel
            for (const asset of args.assets) {
                fetch_promises.push(load_asset(asset));
            }
            await Promise.all(fetch_promises);
            _finalize_startup(args, ctx);
        }
        catch (err) {
            console.error("MONO_WASM: Error in mono_load_runtime_and_bcl_args:", err);
            runtime_is_initialized_reject(err);
            throw err;
        }
    }
    // used from Blazor
    function mono_wasm_load_data_archive(data, prefix) {
        if (data.length < 8)
            return false;
        const dataview = new DataView(data.buffer);
        const magic = dataview.getUint32(0, true);
        //    get magic number
        if (magic != 0x626c6174) {
            return false;
        }
        const manifestSize = dataview.getUint32(4, true);
        if (manifestSize == 0 || data.length < manifestSize + 8)
            return false;
        let manifest;
        try {
            const manifestContent = Module.UTF8ArrayToString(data, 8, manifestSize);
            manifest = JSON.parse(manifestContent);
            if (!(manifest instanceof Array))
                return false;
        }
        catch (exc) {
            return false;
        }
        data = data.slice(manifestSize + 8);
        // Create the folder structure
        // /usr/share/zoneinfo
        // /usr/share/zoneinfo/Africa
        // /usr/share/zoneinfo/Asia
        // ..
        const folders = new Set();
        manifest.filter(m => {
            const file = m[0];
            const last = file.lastIndexOf("/");
            const directory = file.slice(0, last + 1);
            folders.add(directory);
        });
        folders.forEach(folder => {
            Module["FS_createPath"](prefix, folder, true, true);
        });
        for (const row of manifest) {
            const name = row[0];
            const length = row[1];
            const bytes = data.slice(0, length);
            Module["FS_createDataFile"](prefix, name, bytes, true, true);
            data = data.slice(length);
        }
        return true;
    }
    /**
     * Loads the mono config file (typically called mono-config.json) asynchroniously
     * Note: the run dependencies are so emsdk actually awaits it in order.
     *
     * @param {string} configFilePath - relative path to the config file
     * @throws Will throw an error if the config file loading fails
     */
    async function mono_wasm_load_config(configFilePath) {
        const module = Module;
        module.addRunDependency(configFilePath);
        try {
            // NOTE: when we add nodejs make sure to include the nodejs fetch package
            const configRaw = await _fetch_asset(configFilePath);
            const config = await configRaw.json();
            runtimeHelpers.config = config;
            config.environment_variables = config.environment_variables || {};
            config.assets = config.assets || [];
            config.runtime_options = config.runtime_options || [];
            config.globalization_mode = config.globalization_mode || "auto" /* AUTO */;
        }
        catch (err) {
            const errMessage = `Failed to load config file ${configFilePath} ${err}`;
            console.error(errMessage);
            runtimeHelpers.config = { message: errMessage, error: err, isError: true };
            runtime_is_initialized_reject(err);
            throw err;
        }
        finally {
            Module.removeRunDependency(configFilePath);
        }
    }
    function mono_wasm_asm_loaded(assembly_name, assembly_ptr, assembly_len, pdb_ptr, pdb_len) {
        // Only trigger this codepath for assemblies loaded after app is ready
        if (runtimeHelpers.mono_wasm_runtime_is_ready !== true)
            return;
        const assembly_name_str = assembly_name !== CharPtrNull ? Module.UTF8ToString(assembly_name).concat(".dll") : "";
        const assembly_data = new Uint8Array(Module.HEAPU8.buffer, assembly_ptr, assembly_len);
        const assembly_b64 = toBase64StringImpl(assembly_data);
        let pdb_b64;
        if (pdb_ptr) {
            const pdb_data = new Uint8Array(Module.HEAPU8.buffer, pdb_ptr, pdb_len);
            pdb_b64 = toBase64StringImpl(pdb_data);
        }
        mono_wasm_raise_debug_event({
            eventName: "AssemblyLoaded",
            assembly_name: assembly_name_str,
            assembly_b64,
            pdb_b64
        });
    }
    function mono_wasm_set_main_args(name, allRuntimeArguments) {
        const main_argc = allRuntimeArguments.length + 1;
        const main_argv = Module._malloc(main_argc * 4);
        let aindex = 0;
        Module.setValue(main_argv + (aindex * 4), INTERNAL$1.mono_wasm_strdup(name), "i32");
        aindex += 1;
        for (let i = 0; i < allRuntimeArguments.length; ++i) {
            Module.setValue(main_argv + (aindex * 4), INTERNAL$1.mono_wasm_strdup(allRuntimeArguments[i]), "i32");
            aindex += 1;
        }
        wrapped_c_functions.mono_wasm_set_main_args(main_argc, main_argv);
    }

    // Licensed to the .NET Foundation under one or more agreements.
    const timeout_queue = [];
    let spread_timers_maximum = 0;
    let isChromium = false;
    let pump_count = 0;
    if (globalThis.navigator) {
        const nav = globalThis.navigator;
        if (nav.userAgentData && nav.userAgentData.brands) {
            isChromium = nav.userAgentData.brands.some((i) => i.brand == "Chromium");
        }
        else if (nav.userAgent) {
            isChromium = nav.userAgent.includes("Chrome");
        }
    }
    function pump_message() {
        while (timeout_queue.length > 0) {
            --pump_count;
            const cb = timeout_queue.shift();
            cb();
        }
        while (pump_count > 0) {
            --pump_count;
            wrapped_c_functions.mono_background_exec();
        }
    }
    function mono_wasm_set_timeout_exec(id) {
        wrapped_c_functions.mono_set_timeout_exec(id);
    }
    function prevent_timer_throttling() {
        if (isChromium) {
            return;
        }
        // this will schedule timers every second for next 6 minutes, it should be called from WebSocket event, to make it work
        // on next call, it would only extend the timers to cover yet uncovered future
        const now = new Date().valueOf();
        const desired_reach_time = now + (1000 * 60 * 6);
        const next_reach_time = Math.max(now + 1000, spread_timers_maximum);
        const light_throttling_frequency = 1000;
        for (let schedule = next_reach_time; schedule < desired_reach_time; schedule += light_throttling_frequency) {
            const delay = schedule - now;
            setTimeout(() => {
                mono_wasm_set_timeout_exec(0);
                pump_count++;
                pump_message();
            }, delay);
        }
        spread_timers_maximum = desired_reach_time;
    }
    function schedule_background_exec() {
        ++pump_count;
        if (typeof globalThis.setTimeout === "function") {
            globalThis.setTimeout(pump_message, 0);
        }
    }
    function mono_set_timeout(timeout, id) {
        if (typeof globalThis.setTimeout === "function") {
            globalThis.setTimeout(function () {
                mono_wasm_set_timeout_exec(id);
            }, timeout);
        }
        else {
            ++pump_count;
            timeout_queue.push(function () {
                mono_wasm_set_timeout_exec(id);
            });
        }
    }

    // Licensed to the .NET Foundation under one or more agreements.
    const listener_registration_count_symbol = Symbol.for("wasm listener_registration_count");
    function mono_wasm_add_event_listener(js_handle, name, listener_gc_handle, optionsHandle) {
        const nameRoot = mono_wasm_new_root(name);
        try {
            const sName = conv_string(nameRoot.value);
            const obj = mono_wasm_get_jsobj_from_js_handle(js_handle);
            if (!obj)
                throw new Error("ERR09: Invalid JS object handle for '" + sName + "'");
            const throttling = isChromium || obj.constructor.name !== "WebSocket"
                ? undefined
                : prevent_timer_throttling;
            const listener = _wrap_delegate_gc_handle_as_function(listener_gc_handle, throttling);
            if (!listener)
                throw new Error("ERR10: Invalid listener gc_handle");
            const options = optionsHandle
                ? mono_wasm_get_jsobj_from_js_handle(optionsHandle)
                : null;
            if (!_use_finalization_registry) {
                // we are counting registrations because same delegate could be registered into multiple sources
                listener[listener_registration_count_symbol] = listener[listener_registration_count_symbol] ? listener[listener_registration_count_symbol] + 1 : 1;
            }
            if (options)
                obj.addEventListener(sName, listener, options);
            else
                obj.addEventListener(sName, listener);
            return MonoStringNull;
        }
        catch (ex) {
            return wrap_error(null, ex);
        }
        finally {
            nameRoot.release();
        }
    }
    function mono_wasm_remove_event_listener(js_handle, name, listener_gc_handle, capture) {
        const nameRoot = mono_wasm_new_root(name);
        try {
            const obj = mono_wasm_get_jsobj_from_js_handle(js_handle);
            if (!obj)
                throw new Error("ERR11: Invalid JS object handle");
            const listener = _lookup_js_owned_object(listener_gc_handle);
            // Removing a nonexistent listener should not be treated as an error
            if (!listener)
                return MonoStringNull;
            const sName = conv_string(nameRoot.value);
            obj.removeEventListener(sName, listener, !!capture);
            // We do not manually remove the listener from the delegate registry here,
            //  because that same delegate may have been used as an event listener for
            //  other events or event targets. The GC will automatically clean it up
            //  and trigger the FinalizationRegistry handler if it's unused
            // When FinalizationRegistry is not supported by this browser, we cleanup manuall after unregistration
            if (!_use_finalization_registry) {
                listener[listener_registration_count_symbol]--;
                if (listener[listener_registration_count_symbol] === 0) {
                    _js_owned_object_finalized(listener_gc_handle);
                }
            }
            return MonoStringNull;
        }
        catch (ex) {
            return wrap_error(null, ex);
        }
        finally {
            nameRoot.release();
        }
    }

    // Licensed to the .NET Foundation under one or more agreements.
    // The .NET Foundation licenses this file to you under the MIT license.
    class Queue {
        constructor() {
            this.queue = [];
            this.offset = 0;
        }
        // initialise the queue and offset
        // Returns the length of the queue.
        getLength() {
            return (this.queue.length - this.offset);
        }
        // Returns true if the queue is empty, and false otherwise.
        isEmpty() {
            return (this.queue.length == 0);
        }
        /* Enqueues the specified item. The parameter is:
        *
        * item - the item to enqueue
        */
        enqueue(item) {
            this.queue.push(item);
        }
        /* Dequeues an item and returns it. If the queue is empty, the value
        * 'undefined' is returned.
        */
        dequeue() {
            // if the queue is empty, return immediately
            if (this.queue.length == 0)
                return undefined;
            // store the item at the front of the queue
            const item = this.queue[this.offset];
            // for GC's sake
            this.queue[this.offset] = null;
            // increment the offset and remove the free space if necessary
            if (++this.offset * 2 >= this.queue.length) {
                this.queue = this.queue.slice(this.offset);
                this.offset = 0;
            }
            // return the dequeued item
            return item;
        }
        /* Returns the item at the front of the queue (without dequeuing it). If the
         * queue is empty then undefined is returned.
         */
        peek() {
            return (this.queue.length > 0 ? this.queue[this.offset] : undefined);
        }
        drain(onEach) {
            while (this.getLength()) {
                const item = this.dequeue();
                onEach(item);
            }
        }
    }

    // Licensed to the .NET Foundation under one or more agreements.
    const wasm_ws_pending_send_buffer = Symbol.for("wasm ws_pending_send_buffer");
    const wasm_ws_pending_send_buffer_offset = Symbol.for("wasm ws_pending_send_buffer_offset");
    const wasm_ws_pending_send_buffer_type = Symbol.for("wasm ws_pending_send_buffer_type");
    const wasm_ws_pending_receive_event_queue = Symbol.for("wasm ws_pending_receive_event_queue");
    const wasm_ws_pending_receive_promise_queue = Symbol.for("wasm ws_pending_receive_promise_queue");
    const wasm_ws_pending_open_promise = Symbol.for("wasm ws_pending_open_promise");
    const wasm_ws_pending_close_promises = Symbol.for("wasm ws_pending_close_promises");
    const wasm_ws_pending_send_promises = Symbol.for("wasm ws_pending_send_promises");
    const wasm_ws_is_aborted = Symbol.for("wasm ws_is_aborted");
    let mono_wasm_web_socket_close_warning = false;
    let _text_decoder_utf8 = undefined;
    let _text_encoder_utf8 = undefined;
    const ws_send_buffer_blocking_threshold = 65536;
    const emptyBuffer = new Uint8Array();
    function mono_wasm_web_socket_open(uri, subProtocols, on_close, web_socket_js_handle, thenable_js_handle, is_exception) {
        const uri_root = mono_wasm_new_root(uri);
        const sub_root = mono_wasm_new_root(subProtocols);
        const on_close_root = mono_wasm_new_root(on_close);
        try {
            const js_uri = conv_string(uri_root.value);
            if (!js_uri) {
                return wrap_error(is_exception, "ERR12: Invalid uri '" + uri_root.value + "'");
            }
            const js_subs = _mono_array_root_to_js_array(sub_root);
            const js_on_close = _wrap_delegate_root_as_function(on_close_root);
            const ws = new globalThis.WebSocket(js_uri, js_subs);
            const { promise, promise_control: open_promise_control } = _create_cancelable_promise();
            ws[wasm_ws_pending_receive_event_queue] = new Queue();
            ws[wasm_ws_pending_receive_promise_queue] = new Queue();
            ws[wasm_ws_pending_open_promise] = open_promise_control;
            ws[wasm_ws_pending_send_promises] = [];
            ws[wasm_ws_pending_close_promises] = [];
            ws.binaryType = "arraybuffer";
            const local_on_open = () => {
                if (ws[wasm_ws_is_aborted])
                    return;
                open_promise_control.resolve(null);
                prevent_timer_throttling();
            };
            const local_on_message = (ev) => {
                if (ws[wasm_ws_is_aborted])
                    return;
                _mono_wasm_web_socket_on_message(ws, ev);
                prevent_timer_throttling();
            };
            const local_on_close = (ev) => {
                ws.removeEventListener("message", local_on_message);
                if (ws[wasm_ws_is_aborted])
                    return;
                js_on_close(ev.code, ev.reason);
                // this reject would not do anything if there was already "open" before it.
                open_promise_control.reject(ev.reason);
                for (const close_promise_control of ws[wasm_ws_pending_close_promises]) {
                    close_promise_control.resolve();
                }
                // send close to any pending receivers, to wake them
                const receive_promise_queue = ws[wasm_ws_pending_receive_promise_queue];
                receive_promise_queue.drain((receive_promise_control) => {
                    const response_root = receive_promise_control.response_root;
                    Module.setValue(response_root.value + 0, 0, "i32"); // count
                    Module.setValue(response_root.value + 4, 2, "i32"); // type:close
                    Module.setValue(response_root.value + 8, 1, "i32"); // end_of_message: true
                    receive_promise_control.resolve(null);
                });
            };
            ws.addEventListener("message", local_on_message);
            ws.addEventListener("open", local_on_open, { once: true });
            ws.addEventListener("close", local_on_close, { once: true });
            const ws_js_handle = mono_wasm_get_js_handle(ws);
            Module.setValue(web_socket_js_handle, ws_js_handle, "i32");
            const { task_ptr, then_js_handle } = _wrap_js_thenable_as_task(promise);
            // task_ptr above is not rooted, we need to return it to mono without any intermediate mono call which could cause GC
            Module.setValue(thenable_js_handle, then_js_handle, "i32");
            return task_ptr;
        }
        catch (ex) {
            return wrap_error(is_exception, ex);
        }
        finally {
            uri_root.release();
            sub_root.release();
            on_close_root.release();
        }
    }
    function mono_wasm_web_socket_send(webSocket_js_handle, buffer_ptr, offset, length, message_type, end_of_message, thenable_js_handle, is_exception) {
        const buffer_root = mono_wasm_new_root(buffer_ptr);
        try {
            const ws = mono_wasm_get_jsobj_from_js_handle(webSocket_js_handle);
            if (!ws)
                throw new Error("ERR17: Invalid JS object handle " + webSocket_js_handle);
            if (ws.readyState != WebSocket.OPEN) {
                throw new Error("InvalidState: The WebSocket is not connected.");
            }
            const whole_buffer = _mono_wasm_web_socket_send_buffering(ws, buffer_root, offset, length, message_type, end_of_message);
            if (!end_of_message || !whole_buffer) {
                return MonoObjectNull; // we are done buffering synchronously, no promise
            }
            return _mono_wasm_web_socket_send_and_wait(ws, whole_buffer, thenable_js_handle);
        }
        catch (ex) {
            return wrap_error(is_exception, ex);
        }
        finally {
            buffer_root.release();
        }
    }
    function mono_wasm_web_socket_receive(webSocket_js_handle, buffer_ptr, offset, length, response_ptr, thenable_js_handle, is_exception) {
        const buffer_root = mono_wasm_new_root(buffer_ptr);
        const response_root = mono_wasm_new_root(response_ptr);
        const release_buffer = () => {
            buffer_root.release();
            response_root.release();
        };
        try {
            const ws = mono_wasm_get_jsobj_from_js_handle(webSocket_js_handle);
            if (!ws)
                throw new Error("ERR18: Invalid JS object handle " + webSocket_js_handle);
            const receive_event_queue = ws[wasm_ws_pending_receive_event_queue];
            const receive_promise_queue = ws[wasm_ws_pending_receive_promise_queue];
            const readyState = ws.readyState;
            if (readyState != WebSocket.OPEN && readyState != WebSocket.CLOSING) {
                throw new Error("InvalidState: The WebSocket is not connected.");
            }
            if (receive_event_queue.getLength()) {
                if (receive_promise_queue.getLength() != 0) {
                    throw new Error("ERR20: Invalid WS state"); // assert
                }
                // finish synchronously
                _mono_wasm_web_socket_receive_buffering(receive_event_queue, buffer_root, offset, length, response_root);
                release_buffer();
                Module.setValue(thenable_js_handle, 0, "i32");
                return MonoObjectNull;
            }
            const { promise, promise_control } = _create_cancelable_promise(release_buffer, release_buffer);
            const receive_promise_control = promise_control;
            receive_promise_control.buffer_root = buffer_root;
            receive_promise_control.buffer_offset = offset;
            receive_promise_control.buffer_length = length;
            receive_promise_control.response_root = response_root;
            receive_promise_queue.enqueue(receive_promise_control);
            const { task_ptr, then_js_handle } = _wrap_js_thenable_as_task(promise);
            // task_ptr above is not rooted, we need to return it to mono without any intermediate mono call which could cause GC
            Module.setValue(thenable_js_handle, then_js_handle, "i32");
            return task_ptr;
        }
        catch (ex) {
            return wrap_error(is_exception, ex);
        }
    }
    function mono_wasm_web_socket_close(webSocket_js_handle, code, reason, wait_for_close_received, thenable_js_handle, is_exception) {
        const reason_root = mono_wasm_new_root(reason);
        try {
            const ws = mono_wasm_get_jsobj_from_js_handle(webSocket_js_handle);
            if (!ws)
                throw new Error("ERR19: Invalid JS object handle " + webSocket_js_handle);
            if (ws.readyState == WebSocket.CLOSED) {
                return MonoObjectNull; // no promise
            }
            const js_reason = conv_string(reason_root.value);
            if (wait_for_close_received) {
                const { promise, promise_control } = _create_cancelable_promise();
                ws[wasm_ws_pending_close_promises].push(promise_control);
                if (js_reason) {
                    ws.close(code, js_reason);
                }
                else {
                    ws.close(code);
                }
                const { task_ptr, then_js_handle } = _wrap_js_thenable_as_task(promise);
                // task_ptr above is not rooted, we need to return it to mono without any intermediate mono call which could cause GC
                Module.setValue(thenable_js_handle, then_js_handle, "i32");
                return task_ptr;
            }
            else {
                if (!mono_wasm_web_socket_close_warning) {
                    mono_wasm_web_socket_close_warning = true;
                    console.warn("WARNING: Web browsers do not support closing the output side of a WebSocket. CloseOutputAsync has closed the socket and discarded any incoming messages.");
                }
                if (js_reason) {
                    ws.close(code, js_reason);
                }
                else {
                    ws.close(code);
                }
                Module.setValue(thenable_js_handle, 0, "i32");
                return MonoObjectNull; // no promise
            }
        }
        catch (ex) {
            return wrap_error(is_exception, ex);
        }
        finally {
            reason_root.release();
        }
    }
    function mono_wasm_web_socket_abort(webSocket_js_handle, is_exception) {
        try {
            const ws = mono_wasm_get_jsobj_from_js_handle(webSocket_js_handle);
            if (!ws)
                throw new Error("ERR18: Invalid JS object handle " + webSocket_js_handle);
            ws[wasm_ws_is_aborted] = true;
            const open_promise_control = ws[wasm_ws_pending_open_promise];
            if (open_promise_control) {
                open_promise_control.reject("OperationCanceledException");
            }
            for (const close_promise_control of ws[wasm_ws_pending_close_promises]) {
                close_promise_control.reject("OperationCanceledException");
            }
            for (const send_promise_control of ws[wasm_ws_pending_send_promises]) {
                send_promise_control.reject("OperationCanceledException");
            }
            ws[wasm_ws_pending_receive_promise_queue].drain(receive_promise_control => {
                receive_promise_control.reject("OperationCanceledException");
            });
            // this is different from Managed implementation
            ws.close(1000, "Connection was aborted.");
            return MonoObjectNull;
        }
        catch (ex) {
            return wrap_error(is_exception, ex);
        }
    }
    function _mono_wasm_web_socket_send_and_wait(ws, buffer, thenable_js_handle) {
        // send and return promise
        ws.send(buffer);
        ws[wasm_ws_pending_send_buffer] = null;
        // if the remaining send buffer is small, we don't block so that the throughput doesn't suffer. 
        // Otherwise we block so that we apply some backpresure to the application sending large data.
        // this is different from Managed implementation
        if (ws.bufferedAmount < ws_send_buffer_blocking_threshold) {
            return MonoObjectNull; // no promise
        }
        // block the promise/task until the browser passed the buffer to OS
        const { promise, promise_control } = _create_cancelable_promise();
        const pending = ws[wasm_ws_pending_send_promises];
        pending.push(promise_control);
        let nextDelay = 1;
        const polling_check = () => {
            // was it all sent yet ?
            if (ws.bufferedAmount === 0) {
                promise_control.resolve(null);
            }
            else if (ws.readyState != WebSocket.OPEN) {
                // only reject if the data were not sent
                // bufferedAmount does not reset to zero once the connection closes
                promise_control.reject("InvalidState: The WebSocket is not connected.");
            }
            else if (!promise_control.isDone) {
                globalThis.setTimeout(polling_check, nextDelay);
                // exponentially longer delays, up to 1000ms
                nextDelay = Math.min(nextDelay * 1.5, 1000);
                return;
            }
            // remove from pending
            const index = pending.indexOf(promise_control);
            if (index > -1) {
                pending.splice(index, 1);
            }
        };
        globalThis.setTimeout(polling_check, 0);
        const { task_ptr, then_js_handle } = _wrap_js_thenable_as_task(promise);
        // task_ptr above is not rooted, we need to return it to mono without any intermediate mono call which could cause GC
        Module.setValue(thenable_js_handle, then_js_handle, "i32");
        return task_ptr;
    }
    function _mono_wasm_web_socket_on_message(ws, event) {
        const event_queue = ws[wasm_ws_pending_receive_event_queue];
        const promise_queue = ws[wasm_ws_pending_receive_promise_queue];
        if (typeof event.data === "string") {
            if (_text_encoder_utf8 === undefined) {
                _text_encoder_utf8 = new TextEncoder();
            }
            event_queue.enqueue({
                type: 0,
                // according to the spec https://encoding.spec.whatwg.org/
                // - Unpaired surrogates will get replaced with 0xFFFD
                // - utf8 encode specifically is defined to never throw
                data: _text_encoder_utf8.encode(event.data),
                offset: 0
            });
        }
        else {
            if (event.data.constructor.name !== "ArrayBuffer") {
                throw new Error("ERR19: WebSocket receive expected ArrayBuffer");
            }
            event_queue.enqueue({
                type: 1,
                data: new Uint8Array(event.data),
                offset: 0
            });
        }
        if (promise_queue.getLength() && event_queue.getLength() > 1) {
            throw new Error("ERR20: Invalid WS state"); // assert
        }
        while (promise_queue.getLength() && event_queue.getLength()) {
            const promise_control = promise_queue.dequeue();
            _mono_wasm_web_socket_receive_buffering(event_queue, promise_control.buffer_root, promise_control.buffer_offset, promise_control.buffer_length, promise_control.response_root);
            promise_control.resolve(null);
        }
        prevent_timer_throttling();
    }
    function _mono_wasm_web_socket_receive_buffering(event_queue, buffer_root, buffer_offset, buffer_length, response_root) {
        const event = event_queue.peek();
        const count = Math.min(buffer_length, event.data.length - event.offset);
        if (count > 0) {
            const targetView = Module.HEAPU8.subarray(buffer_root.value + buffer_offset, buffer_root.value + buffer_offset + buffer_length);
            const sourceView = event.data.subarray(event.offset, event.offset + count);
            targetView.set(sourceView, 0);
            event.offset += count;
        }
        const end_of_message = event.data.length === event.offset ? 1 : 0;
        if (end_of_message) {
            event_queue.dequeue();
        }
        Module.setValue(response_root.value + 0, count, "i32");
        Module.setValue(response_root.value + 4, event.type, "i32");
        Module.setValue(response_root.value + 8, end_of_message, "i32");
    }
    function _mono_wasm_web_socket_send_buffering(ws, buffer_root, buffer_offset, length, message_type, end_of_message) {
        let buffer = ws[wasm_ws_pending_send_buffer];
        let offset = 0;
        const message_ptr = buffer_root.value + buffer_offset;
        if (buffer) {
            offset = ws[wasm_ws_pending_send_buffer_offset];
            // match desktop WebSocket behavior by copying message_type of the first part
            message_type = ws[wasm_ws_pending_send_buffer_type];
            // if not empty message, append to existing buffer
            if (length !== 0) {
                const view = Module.HEAPU8.subarray(message_ptr, message_ptr + length);
                if (offset + length > buffer.length) {
                    const newbuffer = new Uint8Array((offset + length + 50) * 1.5); // exponential growth
                    newbuffer.set(buffer, 0); // copy previous buffer
                    newbuffer.set(view, offset); // append copy at the end
                    ws[wasm_ws_pending_send_buffer] = buffer = newbuffer;
                }
                else {
                    buffer.set(view, offset); // append copy at the end
                }
                offset += length;
                ws[wasm_ws_pending_send_buffer_offset] = offset;
            }
        }
        else if (!end_of_message) {
            // create new buffer
            if (length !== 0) {
                const view = Module.HEAPU8.subarray(message_ptr, message_ptr + length);
                buffer = new Uint8Array(view); // copy
                offset = length;
                ws[wasm_ws_pending_send_buffer_offset] = offset;
                ws[wasm_ws_pending_send_buffer] = buffer;
            }
            ws[wasm_ws_pending_send_buffer_type] = message_type;
        }
        else {
            // use the buffer only localy
            if (length !== 0) {
                const memoryView = Module.HEAPU8.subarray(message_ptr, message_ptr + length);
                buffer = memoryView; // send will make a copy
                offset = length;
            }
        }
        // buffer was updated, do we need to trim and convert it to final format ?
        if (end_of_message) {
            if (offset == 0 || buffer == null) {
                return emptyBuffer;
            }
            if (message_type === 0) {
                // text, convert from UTF-8 bytes to string, because of bad browser API
                if (_text_decoder_utf8 === undefined) {
                    // we do not validate outgoing data https://github.com/dotnet/runtime/issues/59214
                    _text_decoder_utf8 = new TextDecoder("utf-8", { fatal: false });
                }
                // See https://github.com/whatwg/encoding/issues/172
                const bytes = typeof SharedArrayBuffer !== "undefined" && buffer instanceof SharedArrayBuffer
                    ? buffer.slice(0, offset)
                    : buffer.subarray(0, offset);
                return _text_decoder_utf8.decode(bytes);
            }
            else {
                // binary, view to used part of the buffer
                return buffer.subarray(0, offset);
            }
        }
        return null;
    }

    // Licensed to the .NET Foundation under one or more agreements.
    const MONO = {
        // current "public" MONO API
        mono_wasm_setenv,
        mono_wasm_load_bytes_into_heap,
        mono_wasm_load_icu_data,
        mono_wasm_runtime_ready,
        mono_wasm_load_data_archive,
        mono_wasm_load_config,
        mono_load_runtime_and_bcl_args,
        mono_wasm_new_root_buffer,
        mono_wasm_new_root,
        mono_wasm_release_roots,
        // for Blazor's future!
        mono_wasm_add_assembly: wrapped_c_functions.mono_wasm_add_assembly,
        mono_wasm_load_runtime: wrapped_c_functions.mono_wasm_load_runtime,
        config: runtimeHelpers.config,
        loaded_files: [],
        // generated bindings closure `library_mono`
        mono_wasm_new_root_buffer_from_pointer,
        mono_wasm_new_roots,
    };
    const BINDING = {
        //current "public" BINDING API
        mono_obj_array_new: wrapped_c_functions.mono_wasm_obj_array_new,
        mono_obj_array_set: wrapped_c_functions.mono_wasm_obj_array_set,
        js_string_to_mono_string,
        js_typed_array_to_array,
        js_to_mono_obj,
        mono_array_to_js_array,
        conv_string,
        bind_static_method: mono_bind_static_method,
        call_assembly_entry_point: mono_call_assembly_entry_point,
        unbox_mono_obj,
        // generated bindings closure `binding_support`
        // todo use the methods directly in the closure, not via BINDING
        _get_args_root_buffer_for_method_call,
        _get_buffer_for_method_call,
        invoke_method: wrapped_c_functions.mono_wasm_invoke_method,
        _handle_exception_for_call,
        mono_wasm_try_unbox_primitive_and_get_type: wrapped_c_functions.mono_wasm_try_unbox_primitive_and_get_type,
        _unbox_mono_obj_root_with_known_nonprimitive_type,
        _teardown_after_call,
    };
    // this is executed early during load of emscripten runtime
    // it exports methods to global objects MONO, BINDING and Module in backward compatible way
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function initializeImportsAndExports(imports, exports) {
        const module = exports.module;
        const globalThisAny = globalThis;
        // we want to have same instance of MONO, BINDING and Module in dotnet iffe
        setImportsAndExports(imports, exports);
        // here we merge methods from the local objects into exported objects
        Object.assign(exports.mono, MONO);
        Object.assign(exports.binding, BINDING);
        Object.assign(exports.internal, INTERNAL);
        const api = {
            MONO: exports.mono,
            BINDING: exports.binding,
            INTERNAL: exports.internal,
            Module: module
        };
        if (module.configSrc) {
            // this could be overriden on Module
            if (!module.preInit) {
                module.preInit = [];
            }
            else if (typeof module.preInit === "function") {
                module.preInit = [module.preInit];
            }
            module.preInit.unshift(mono_wasm_pre_init);
        }
        // this could be overriden on Module
        if (!module.onRuntimeInitialized) {
            module.onRuntimeInitialized = mono_wasm_on_runtime_initialized;
        }
        if (!module.print) {
            module.print = console.log;
        }
        if (!module.printErr) {
            module.printErr = console.error;
        }
        if (imports.isGlobal || !module.disableDotNet6Compatibility) {
            Object.assign(module, api);
            // backward compatibility
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            module.mono_bind_static_method = (fqn, signature) => {
                console.warn("Module.mono_bind_static_method is obsolete, please use BINDING.bind_static_method instead");
                return mono_bind_static_method(fqn, signature);
            };
            // here we expose objects used in tests to global namespace
            const warnWrap = (name, provider) => {
                if (typeof globalThisAny[name] !== "undefined") {
                    // it already exists in the global namespace
                    return;
                }
                let value = undefined;
                Object.defineProperty(globalThis, name, {
                    get: () => {
                        if (!value) {
                            const stack = (new Error()).stack;
                            const nextLine = stack ? stack.substr(stack.indexOf("\n", 8) + 1) : "";
                            console.warn(`global ${name} is obsolete, please use Module.${name} instead ${nextLine}`);
                            value = provider();
                        }
                        return value;
                    }
                });
            };
            globalThisAny.MONO = exports.mono;
            globalThisAny.BINDING = exports.binding;
            globalThisAny.INTERNAL = exports.internal;
            if (!imports.isGlobal) {
                globalThisAny.Module = module;
            }
            // Blazor back compat
            warnWrap("cwrap", () => module.cwrap);
            warnWrap("addRunDependency", () => module.addRunDependency);
            warnWrap("removeRunDependency", () => module.removeRunDependency);
        }
    }
    const __initializeImportsAndExports = initializeImportsAndExports; // don't want to export the type
    // the methods would be visible to EMCC linker
    // --- keep in sync with dotnet.lib.js ---
    const __linker_exports = {
        // mini-wasm.c
        mono_set_timeout,
        // mini-wasm-debugger.c
        mono_wasm_asm_loaded,
        mono_wasm_fire_debugger_agent_message,
        // mono-threads-wasm.c
        schedule_background_exec,
        // also keep in sync with driver.c
        mono_wasm_invoke_js,
        mono_wasm_invoke_js_blazor,
        // also keep in sync with corebindings.c
        mono_wasm_invoke_js_with_args,
        mono_wasm_get_object_property,
        mono_wasm_set_object_property,
        mono_wasm_get_by_index,
        mono_wasm_set_by_index,
        mono_wasm_get_global_object,
        mono_wasm_create_cs_owned_object,
        mono_wasm_release_cs_owned_object,
        mono_wasm_typed_array_to_array,
        mono_wasm_typed_array_copy_to,
        mono_wasm_typed_array_from,
        mono_wasm_typed_array_copy_from,
        mono_wasm_add_event_listener,
        mono_wasm_remove_event_listener,
        mono_wasm_cancel_promise,
        mono_wasm_web_socket_open,
        mono_wasm_web_socket_send,
        mono_wasm_web_socket_receive,
        mono_wasm_web_socket_close,
        mono_wasm_web_socket_abort,
        mono_wasm_compile_function,
        //  also keep in sync with pal_icushim_static.c
        mono_wasm_load_icu_data,
        mono_wasm_get_icudt_name,
    };
    const INTERNAL = {
        // startup
        BINDING_ASM: "[System.Private.Runtime.InteropServices.JavaScript]System.Runtime.InteropServices.JavaScript.Runtime",
        // tests
        call_static_method,
        mono_wasm_exit: wrapped_c_functions.mono_wasm_exit,
        mono_wasm_enable_on_demand_gc: wrapped_c_functions.mono_wasm_enable_on_demand_gc,
        mono_profiler_init_aot: wrapped_c_functions.mono_profiler_init_aot,
        mono_wasm_set_runtime_options,
        mono_wasm_set_main_args: mono_wasm_set_main_args,
        mono_wasm_strdup: wrapped_c_functions.mono_wasm_strdup,
        mono_wasm_exec_regression: wrapped_c_functions.mono_wasm_exec_regression,
        mono_method_resolve,
        mono_bind_static_method,
        mono_intern_string,
        // EM_JS,EM_ASM,EM_ASM_INT macros
        string_decoder,
        logging: undefined,
        // used in EM_ASM macros in debugger
        mono_wasm_add_dbg_command_received,
        // used in debugger DevToolsHelper.cs
        mono_wasm_get_loaded_files,
        mono_wasm_send_dbg_command_with_parms,
        mono_wasm_send_dbg_command,
        mono_wasm_get_dbg_command_info,
        mono_wasm_get_details,
        mono_wasm_release_object,
        mono_wasm_call_function_on,
        mono_wasm_debugger_resume,
        mono_wasm_detach_debugger,
        mono_wasm_raise_debug_event,
        mono_wasm_runtime_is_ready: runtimeHelpers.mono_wasm_runtime_is_ready,
        // memory accessors
        setI8,
        setI16,
        setI32,
        setI64,
        setU8,
        setU16,
        setU32,
        setF32,
        setF64,
        getI8,
        getI16,
        getI32,
        getI64,
        getU8,
        getU16,
        getU32,
        getF32,
        getF64,
    };

    exports.__initializeImportsAndExports = __initializeImportsAndExports;
    exports.__linker_exports = __linker_exports;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));


"use strict";

// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module !== 'undefined' ? Module : {};

// See https://caniuse.com/mdn-javascript_builtins_object_assign
var objAssign = Object.assign;

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// {{PRE_JSES}}

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = objAssign({}, Module);

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

// Three configurations we can be running in:
// 1) We could be the application main() thread running in the main JS UI thread. (ENVIRONMENT_IS_WORKER == false and ENVIRONMENT_IS_PTHREAD == false)
// 2) We could be the application main() thread proxied to worker. (with Emscripten -s PROXY_TO_WORKER=1) (ENVIRONMENT_IS_WORKER == true, ENVIRONMENT_IS_PTHREAD == false)
// 3) We could be an application pthread running in a worker. (ENVIRONMENT_IS_WORKER == true and ENVIRONMENT_IS_PTHREAD == true)

// ENVIRONMENT_IS_PTHREAD=true will have been preset in worker.js. Make it false in the main runtime thread.
var ENVIRONMENT_IS_PTHREAD = Module['ENVIRONMENT_IS_PTHREAD'] || false;

// In MODULARIZE mode _scriptDir needs to be captured already at the very top of the page immediately when the page is parsed, so it is generated there
// before the page load. In non-MODULARIZE modes generate it here.
var _scriptDir = (typeof document !== 'undefined' && document.currentScript) ? document.currentScript.src : undefined;

if (ENVIRONMENT_IS_WORKER) {
  _scriptDir = self.location.href;
}
else if (ENVIRONMENT_IS_NODE) {
  _scriptDir = __filename;
}

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary,
    setWindowTitle;

// Normally we don't log exceptions but instead let them bubble out the top
// level where the embedding environment (e.g. the browser) can handle
// them.
// However under v8 and node we sometimes exit the process direcly in which case
// its up to use us to log the exception before exiting.
// If we fix https://github.com/emscripten-core/emscripten/issues/15080
// this may no longer be needed under node.
function logExceptionOnExit(e) {
  if (e instanceof ExitStatus) return;
  let toLog = e;
  err('exiting due to exception: ' + toLog);
}

var fs;
var nodePath;
var requireNodeFS;

if (ENVIRONMENT_IS_NODE) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = require('path').dirname(scriptDirectory) + '/';
  } else {
    scriptDirectory = __dirname + '/';
  }

// include: node_shell_read.js


requireNodeFS = () => {
  // Use nodePath as the indicator for these not being initialized,
  // since in some environments a global fs may have already been
  // created.
  if (!nodePath) {
    fs = require('fs');
    nodePath = require('path');
  }
};

read_ = function shell_read(filename, binary) {
  requireNodeFS();
  filename = nodePath['normalize'](filename);
  return fs.readFileSync(filename, binary ? null : 'utf8');
};

readBinary = (filename) => {
  var ret = read_(filename, true);
  if (!ret.buffer) {
    ret = new Uint8Array(ret);
  }
  return ret;
};

readAsync = (filename, onload, onerror) => {
  requireNodeFS();
  filename = nodePath['normalize'](filename);
  fs.readFile(filename, function(err, data) {
    if (err) onerror(err);
    else onload(data.buffer);
  });
};

// end include: node_shell_read.js
  if (process['argv'].length > 1) {
    thisProgram = process['argv'][1].replace(/\\/g, '/');
  }

  arguments_ = process['argv'].slice(2);

  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });

  // Without this older versions of node (< v15) will log unhandled rejections
  // but return 0, which is not normally the desired behaviour.  This is
  // not be needed with node v15 and about because it is now the default
  // behaviour:
  // See https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode
  process['on']('unhandledRejection', function(reason) { throw reason; });

  quit_ = (status, toThrow) => {
    if (keepRuntimeAlive()) {
      process['exitCode'] = status;
      throw toThrow;
    }
    logExceptionOnExit(toThrow);
    process['exit'](status);
  };

  Module['inspect'] = function () { return '[Emscripten Module object]'; };

  let nodeWorkerThreads;
  try {
    nodeWorkerThreads = require('worker_threads');
  } catch (e) {
    console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?');
    throw e;
  }
  global.Worker = nodeWorkerThreads.Worker;

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document !== 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
  // they are removed because they could contain a slash.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  if (!ENVIRONMENT_IS_NODE)
  {
// include: web_or_worker_shell_read.js


  read_ = (url) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
  }

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = (url) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
    };
  }

  readAsync = (url, onload, onerror) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  }

// end include: web_or_worker_shell_read.js
  }

  setWindowTitle = (title) => document.title = title;
} else
{
}

if (ENVIRONMENT_IS_NODE) {
  // Polyfill the performance object, which emscripten pthreads support
  // depends on for good timing.
  if (typeof performance === 'undefined') {
    global.performance = require('perf_hooks').performance;
  }
}

// Set up the out() and err() hooks, which are how we can print to stdout or
// stderr, respectively.
// Normally just binding console.log/console.warn here works fine, but
// under node (with workers) we see missing/out-of-order messages so route
// directly to stdout and stderr.
// See https://github.com/emscripten-core/emscripten/issues/14804
var defaultPrint = console.log.bind(console);
var defaultPrintErr = console.warn.bind(console);
if (ENVIRONMENT_IS_NODE) {
  requireNodeFS();
  defaultPrint = (str) => fs.writeSync(1, str + '\n');
  defaultPrintErr = (str) => fs.writeSync(2, str + '\n');
}
var out = Module['print'] || defaultPrint;
var err = Module['printErr'] || defaultPrintErr;

// Merge back in the overrides
objAssign(Module, moduleOverrides);
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];

if (Module['thisProgram']) thisProgram = Module['thisProgram'];

if (Module['quit']) quit_ = Module['quit'];

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message




var STACK_ALIGN = 16;
var POINTER_SIZE = 4;

function getNativeTypeSize(type) {
  switch (type) {
    case 'i1': case 'i8': return 1;
    case 'i16': return 2;
    case 'i32': return 4;
    case 'i64': return 8;
    case 'float': return 4;
    case 'double': return 8;
    default: {
      if (type[type.length - 1] === '*') {
        return POINTER_SIZE;
      } else if (type[0] === 'i') {
        const bits = Number(type.substr(1));
        assert(bits % 8 === 0, 'getNativeTypeSize invalid bits ' + bits + ', type ' + type);
        return bits / 8;
      } else {
        return 0;
      }
    }
  }
}

function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}

// include: runtime_functions.js


// Wraps a JS function as a wasm function with a given signature.
function convertJsFunctionToWasm(func, sig) {

  // If the type reflection proposal is available, use the new
  // "WebAssembly.Function" constructor.
  // Otherwise, construct a minimal wasm module importing the JS function and
  // re-exporting it.
  if (typeof WebAssembly.Function === "function") {
    var typeNames = {
      'i': 'i32',
      'j': 'i64',
      'f': 'f32',
      'd': 'f64'
    };
    var type = {
      parameters: [],
      results: sig[0] == 'v' ? [] : [typeNames[sig[0]]]
    };
    for (var i = 1; i < sig.length; ++i) {
      type.parameters.push(typeNames[sig[i]]);
    }
    return new WebAssembly.Function(type, func);
  }

  // The module is static, with the exception of the type section, which is
  // generated based on the signature passed in.
  var typeSection = [
    0x01, // id: section,
    0x00, // length: 0 (placeholder)
    0x01, // count: 1
    0x60, // form: func
  ];
  var sigRet = sig.slice(0, 1);
  var sigParam = sig.slice(1);
  var typeCodes = {
    'i': 0x7f, // i32
    'j': 0x7e, // i64
    'f': 0x7d, // f32
    'd': 0x7c, // f64
  };

  // Parameters, length + signatures
  typeSection.push(sigParam.length);
  for (var i = 0; i < sigParam.length; ++i) {
    typeSection.push(typeCodes[sigParam[i]]);
  }

  // Return values, length + signatures
  // With no multi-return in MVP, either 0 (void) or 1 (anything else)
  if (sigRet == 'v') {
    typeSection.push(0x00);
  } else {
    typeSection = typeSection.concat([0x01, typeCodes[sigRet]]);
  }

  // Write the overall length of the type section back into the section header
  // (excepting the 2 bytes for the section id and length)
  typeSection[1] = typeSection.length - 2;

  // Rest of the module is static
  var bytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic ("\0asm")
    0x01, 0x00, 0x00, 0x00, // version: 1
  ].concat(typeSection, [
    0x02, 0x07, // import section
      // (import "e" "f" (func 0 (type 0)))
      0x01, 0x01, 0x65, 0x01, 0x66, 0x00, 0x00,
    0x07, 0x05, // export section
      // (export "f" (func 0 (type 0)))
      0x01, 0x01, 0x66, 0x00, 0x00,
  ]));

   // We can compile this wasm module synchronously because it is very small.
  // This accepts an import (at "e.f"), that it reroutes to an export (at "f")
  var module = new WebAssembly.Module(bytes);
  var instance = new WebAssembly.Instance(module, {
    'e': {
      'f': func
    }
  });
  var wrappedFunc = instance.exports['f'];
  return wrappedFunc;
}

var freeTableIndexes = [];

// Weak map of functions in the table to their indexes, created on first use.
var functionsInTableMap;

function getEmptyTableSlot() {
  // Reuse a free index if there is one, otherwise grow.
  if (freeTableIndexes.length) {
    return freeTableIndexes.pop();
  }
  // Grow the table
  try {
    wasmTable.grow(1);
  } catch (err) {
    if (!(err instanceof RangeError)) {
      throw err;
    }
    throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
  }
  return wasmTable.length - 1;
}

function updateTableMap(offset, count) {
  for (var i = offset; i < offset + count; i++) {
    var item = getWasmTableEntry(i);
    // Ignore null values.
    if (item) {
      functionsInTableMap.set(item, i);
    }
  }
}

// Add a function to the table.
// 'sig' parameter is required if the function being added is a JS function.
function addFunction(func, sig) {

  // Check if the function is already in the table, to ensure each function
  // gets a unique index. First, create the map if this is the first use.
  if (!functionsInTableMap) {
    functionsInTableMap = new WeakMap();
    updateTableMap(0, wasmTable.length);
  }
  if (functionsInTableMap.has(func)) {
    return functionsInTableMap.get(func);
  }

  // It's not in the table, add it now.

  var ret = getEmptyTableSlot();

  // Set the new value.
  try {
    // Attempting to call this with JS function will cause of table.set() to fail
    setWasmTableEntry(ret, func);
  } catch (err) {
    if (!(err instanceof TypeError)) {
      throw err;
    }
    var wrapped = convertJsFunctionToWasm(func, sig);
    setWasmTableEntry(ret, wrapped);
  }

  functionsInTableMap.set(func, ret);

  return ret;
}

function removeFunction(index) {
  functionsInTableMap.delete(getWasmTableEntry(index));
  freeTableIndexes.push(index);
}

// end include: runtime_functions.js
// include: runtime_debug.js


// end include: runtime_debug.js
var tempRet0 = 0;
var setTempRet0 = (value) => { tempRet0 = value; };
var getTempRet0 = () => tempRet0;

// JS library code refers to Atomics in the manner used from asm.js, provide
// the same API here.
var Atomics_load = Atomics.load;
var Atomics_store = Atomics.store;
var Atomics_compareExchange = Atomics.compareExchange;



// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
var noExitRuntime = Module['noExitRuntime'] || true;

if (typeof WebAssembly !== 'object') {
  abort('no native wasm support detected');
}

// include: runtime_safe_heap.js


// In MINIMAL_RUNTIME, setValue() and getValue() are only available when building with safe heap enabled, for heap safety checking.
// In traditional runtime, setValue() and getValue() are always available (although their use is highly discouraged due to perf penalties)

/** @param {number} ptr
    @param {number} value
    @param {string} type
    @param {number|boolean=} noSafe */
function setValue(ptr, value, type = 'i8', noSafe) {
  if (type.charAt(type.length-1) === '*') type = 'i32';
    switch (type) {
      case 'i1': HEAP8[((ptr)>>0)] = value; break;
      case 'i8': HEAP8[((ptr)>>0)] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)] = tempI64[0],HEAP32[(((ptr)+(4))>>2)] = tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}

/** @param {number} ptr
    @param {string} type
    @param {number|boolean=} noSafe */
function getValue(ptr, type = 'i8', noSafe) {
  if (type.charAt(type.length-1) === '*') type = 'i32';
    switch (type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return Number(HEAPF64[((ptr)>>3)]);
      default: abort('invalid type for getValue: ' + type);
    }
  return null;
}

// end include: runtime_safe_heap.js
// Wasm globals

var wasmMemory;

// For sending to workers.
var wasmModule;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    // This build was created without ASSERTIONS defined.  `assert()` should not
    // ever be called in this configuration but in case there are callers in
    // the wild leave this simple abort() implemenation here for now.
    abort(text);
  }
}

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  return func;
}

// C calling interface.
/** @param {string|null=} returnType
    @param {Array=} argTypes
    @param {Arguments|Array=} args
    @param {Object=} opts */
function ccall(ident, returnType, argTypes, args, opts) {
  // For fast lookup of conversion functions
  var toC = {
    'string': function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        var len = (str.length << 2) + 1;
        ret = stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
    'array': function(arr) {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    }
  };

  function convertReturnValue(ret) {
    if (returnType === 'string') return UTF8ToString(ret);
    if (returnType === 'boolean') return Boolean(ret);
    return ret;
  }

  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);
  function onDone(ret) {
    if (stack !== 0) stackRestore(stack);
    return convertReturnValue(ret);
  }

  ret = onDone(ret);
  return ret;
}

/** @param {string=} returnType
    @param {Array=} argTypes
    @param {Object=} opts */
function cwrap(ident, returnType, argTypes, opts) {
  argTypes = argTypes || [];
  // When the function takes numbers and returns a number, we can just return
  // the original function
  var numericArgs = argTypes.every(function(type){ return type === 'number'});
  var numericRet = returnType !== 'string';
  if (numericRet && numericArgs && !opts) {
    return getCFunc(ident);
  }
  return function() {
    return ccall(ident, returnType, argTypes, arguments, opts);
  }
}

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data.
// @allocator: How to allocate memory, see ALLOC_*
/** @type {function((Uint8Array|Array<number>), number)} */
function allocate(slab, allocator) {
  var ret;

  if (allocator == ALLOC_STACK) {
    ret = stackAlloc(slab.length);
  } else {
    ret = _malloc(slab.length);
  }

  if (slab.subarray || slab.slice) {
    HEAPU8.set(/** @type {!Uint8Array} */(slab), ret);
  } else {
    HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
}

// include: runtime_strings.js


// runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

// UTF8Decoder.decode may not work with a view of a SharedArrayBuffer, see
// https://github.com/whatwg/encoding/issues/172
// To avoid that, we wrap around it and add a copy into a normal ArrayBuffer,
// which can still be much faster than creating a string character by
// character.
function TextDecoderWrapper(encoding) {
  var textDecoder = new TextDecoder(encoding);
  this.decode = (data) => {
    // While we compile with pthreads, this method can be called on side buffers
    // as well, such as the stdout buffer in the filesystem code. Only copy when
    // we have to.
    if (data.buffer instanceof SharedArrayBuffer) {
      data = new Uint8Array(data);
    }
    return textDecoder.decode.call(textDecoder, data);
  };
}

var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoderWrapper('utf8') : undefined;

/**
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ArrayToString(heap, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
  while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(heap.subarray(idx, endPtr));
  } else {
    var str = '';
    // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
    while (idx < endPtr) {
      // For UTF8 byte structure, see:
      // http://en.wikipedia.org/wiki/UTF-8#Description
      // https://www.ietf.org/rfc/rfc2279.txt
      // https://tools.ietf.org/html/rfc3629
      var u0 = heap[idx++];
      if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
      var u1 = heap[idx++] & 63;
      if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
      var u2 = heap[idx++] & 63;
      if ((u0 & 0xF0) == 0xE0) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heap[idx++] & 63);
      }

      if (u0 < 0x10000) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 0x10000;
        str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
      }
    }
  }
  return str;
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
// copy of that string as a Javascript String object.
// maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
//                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
//                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
//                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
//                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
//                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
//                 throw JS JIT optimizations off, so it is worth to consider consistently using one
//                 style or the other.
/**
 * @param {number} ptr
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ToString(ptr, maxBytesToRead) {
  ;
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) {
      var u1 = str.charCodeAt(++i);
      u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 0xC0 | (u >> 6);
      heap[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 0xE0 | (u >> 12);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      heap[outIdx++] = 0xF0 | (u >> 18);
      heap[outIdx++] = 0x80 | ((u >> 12) & 63);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) ++len;
    else if (u <= 0x7FF) len += 2;
    else if (u <= 0xFFFF) len += 3;
    else len += 4;
  }
  return len;
}

// end include: runtime_strings.js
// include: runtime_strings_extra.js


// runtime_strings_extra.js: Strings related runtime functions that are available only in regular runtime.

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = '';
  while (1) {
    var ch = HEAPU8[((ptr++)>>0)];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoderWrapper('utf-16le') : undefined;

function UTF16ToString(ptr, maxBytesToRead) {
  var endPtr = ptr;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  var idx = endPtr >> 1;
  var maxIdx = idx + maxBytesToRead / 2;
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
  endPtr = idx << 1;

  if (endPtr - ptr > 32 && UTF16Decoder) {
    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  } else {
    var str = '';

    // If maxBytesToRead is not passed explicitly, it will be undefined, and the for-loop's condition
    // will always evaluate to true. The loop is then terminated on the first null char.
    for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
      var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
      if (codeUnit == 0) break;
      // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
      str += String.fromCharCode(codeUnit);
    }

    return str;
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[((outPtr)>>1)] = codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[((outPtr)>>1)] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length*2;
}

function UTF32ToString(ptr, maxBytesToRead) {
  var i = 0;

  var str = '';
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(i >= maxBytesToRead / 4)) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0) break;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
  return str;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[((outPtr)>>2)] = codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[((outPtr)>>2)] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}

// Allocate heap space for a JS string, and write it there.
// It is the responsibility of the caller to free() that memory.
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Allocate stack space for a JS string, and write it there.
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Deprecated: This function should not be called because it is unsafe and does not provide
// a maximum length limit of how many bytes it is allowed to write. Prefer calling the
// function stringToUTF8Array() instead, which takes in a maximum length that can be used
// to be secure from out of bounds writes.
/** @deprecated
    @param {boolean=} dontAddNull */
function writeStringToMemory(string, buffer, dontAddNull) {
  warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');

  var /** @type {number} */ lastChar, /** @type {number} */ end;
  if (dontAddNull) {
    // stringToUTF8Array always appends null. If we don't want to do that, remember the
    // character that existed at the location where the null will be placed, and restore
    // that after the write (below).
    end = buffer + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
}

function writeArrayToMemory(array, buffer) {
  HEAP8.set(array, buffer);
}

/** @param {boolean=} dontAddNull */
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    HEAP8[((buffer++)>>0)] = str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[((buffer)>>0)] = 0;
}

// end include: runtime_strings_extra.js
// Memory management

function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple);
  }
  return x;
}

var HEAP,
/** @type {ArrayBuffer} */
  buffer,
/** @type {Int8Array} */
  HEAP8,
/** @type {Uint8Array} */
  HEAPU8,
/** @type {Int16Array} */
  HEAP16,
/** @type {Uint16Array} */
  HEAPU16,
/** @type {Int32Array} */
  HEAP32,
/** @type {Uint32Array} */
  HEAPU32,
/** @type {Float32Array} */
  HEAPF32,
/** @type {Float64Array} */
  HEAPF64;

if (ENVIRONMENT_IS_PTHREAD) {
  // Grab imports from the pthread to local scope.
  buffer = Module['buffer'];
  // Note that not all runtime fields are imported above
}

function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module['HEAP8'] = HEAP8 = new Int8Array(buf);
  Module['HEAP16'] = HEAP16 = new Int16Array(buf);
  Module['HEAP32'] = HEAP32 = new Int32Array(buf);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
}

var TOTAL_STACK = 5242880;

var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 1073741824;

// In non-standalone/normal mode, we create the memory here.
// include: runtime_init_memory.js


// Create the wasm memory. (Note: this only applies if IMPORTED_MEMORY is defined)

if (ENVIRONMENT_IS_PTHREAD) {
  wasmMemory = Module['wasmMemory'];
  buffer = Module['buffer'];
} else {

  if (Module['wasmMemory']) {
    wasmMemory = Module['wasmMemory'];
  } else
  {
    wasmMemory = new WebAssembly.Memory({
      'initial': INITIAL_MEMORY / 65536,
      'maximum': INITIAL_MEMORY / 65536
      ,
      'shared': true
    });
    if (!(wasmMemory.buffer instanceof SharedArrayBuffer)) {
      err('requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag');
      if (ENVIRONMENT_IS_NODE) {
        console.log('(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and also use a recent version)');
      }
      throw Error('bad memory');
    }
  }

}

if (wasmMemory) {
  buffer = wasmMemory.buffer;
}

// If the user provides an incorrect length, just use that length instead rather than providing the user to
// specifically provide the memory length with Module['INITIAL_MEMORY'].
INITIAL_MEMORY = buffer.byteLength;
updateGlobalBufferAndViews(buffer);

// end include: runtime_init_memory.js

// include: runtime_init_table.js
// In regular non-RELOCATABLE mode the table is exported
// from the wasm module and this will be assigned once
// the exports are available.
var wasmTable;

// end include: runtime_init_table.js
// include: runtime_stack_check.js


// end include: runtime_stack_check.js
// include: runtime_assertions.js


// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;
var runtimeExited = false;
var runtimeKeepaliveCounter = 0;

function keepRuntimeAlive() {
  return noExitRuntime || runtimeKeepaliveCounter > 0;
}

function preRun() {

  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  runtimeInitialized = true;

  if (ENVIRONMENT_IS_PTHREAD) return;

  
if (!Module["noFSInit"] && !FS.init.initialized)
  FS.init();
FS.ignorePermissions = false;

TTY.init();
SOCKFS.root = FS.mount(SOCKFS, {}, null);
  callRuntimeCallbacks(__ATINIT__);
}

function exitRuntime() {
  if (ENVIRONMENT_IS_PTHREAD) return; // PThreads reuse the runtime from the main thread.
  PThread.terminateAllThreads();
  runtimeExited = true;
}

function postRun() {
  if (ENVIRONMENT_IS_PTHREAD) return; // PThreads reuse the runtime from the main thread.

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function getUniqueRunDependency(id) {
  return id;
}

function addRunDependency(id) {
  runDependencies++;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

}

function removeRunDependency(id) {
  runDependencies--;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data

/** @param {string|number=} what */
function abort(what) {
  // When running on a pthread, none of the incoming parameters on the module
  // object are present.  The `onAbort` handler only exists on the main thread
  // and so we need to proxy the handling of these back to the main thread.
  // TODO(sbc): Extend this to all such handlers that can be passed into on
  // module creation.
  if (ENVIRONMENT_IS_PTHREAD) {
    postMessage({ 'cmd': 'onAbort', 'arg': what});
  } else
  {
    if (Module['onAbort']) {
      Module['onAbort'](what);
    }
  }

  what = 'Aborted(' + what + ')';
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  what += '. Build with -s ASSERTIONS=1 for more info.';

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  var e = new WebAssembly.RuntimeError(what);

  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// {{MEM_INITIALIZER}}

// include: memoryprofiler.js


// end include: memoryprofiler.js
// include: URIUtils.js


// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  // Prefix of data URIs emitted by SINGLE_FILE and related options.
  return filename.startsWith(dataURIPrefix);
}

// Indicates whether filename is delivered via file protocol (as opposed to http/https)
function isFileURI(filename) {
  return filename.startsWith('file://');
}

// end include: URIUtils.js
var wasmBinaryFile;
  wasmBinaryFile = 'dotnet.wasm';
  if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }

function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    if (readBinary) {
      return readBinary(file);
    } else {
      throw "both async and sync fetching of the wasm failed";
    }
  }
  catch (err) {
    abort(err);
  }
}

function getBinaryPromise() {
  // If we don't have the binary yet, try to to load it asynchronously.
  // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
  // See https://github.com/github/fetch/pull/92#issuecomment-140665932
  // Cordova or Electron apps are typically loaded from a file:// url.
  // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch === 'function'
      && !isFileURI(wasmBinaryFile)
    ) {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
        if (!response['ok']) {
          throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        }
        return response['arrayBuffer']();
      }).catch(function () {
          return getBinary(wasmBinaryFile);
      });
    }
    else {
      if (readAsync) {
        // fetch is not available or url is file => try XHR (readAsync uses XHR internally)
        return new Promise(function(resolve, reject) {
          readAsync(wasmBinaryFile, function(response) { resolve(new Uint8Array(/** @type{!ArrayBuffer} */(response))) }, reject)
        });
      }
    }
  }

  // Otherwise, getBinary should be able to get it synchronously
  return Promise.resolve().then(function() { return getBinary(wasmBinaryFile); });
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': asmLibraryArg,
    'wasi_snapshot_preview1': asmLibraryArg,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    var exports = instance.exports;

    Module['asm'] = exports;

    registerTlsInit(Module['asm']['emscripten_tls_init']);

    wasmTable = Module['asm']['__indirect_function_table'];

    addOnInit(Module['asm']['__wasm_call_ctors']);

    // We now have the Wasm module loaded up, keep a reference to the compiled module so we can post it to the workers.
    wasmModule = module;
    // Instantiation is synchronous in pthreads and we assert on run dependencies.
    if (!ENVIRONMENT_IS_PTHREAD) {
      var numWorkersToLoad = PThread.unusedWorkers.length;
      PThread.unusedWorkers.forEach(function(w) { PThread.loadWasmModuleToWorker(w, function() {
        // PTHREAD_POOL_DELAY_LOAD==0: we wanted to synchronously wait until the Worker pool
        // has loaded up. If all Workers have finished loading up the Wasm Module, proceed with main()
        if (!--numWorkersToLoad) removeRunDependency('wasm-instantiate');
      })});
    }
  }
  // we can't run yet (except in a pthread, where we have a custom sync instantiator)
  if (!ENVIRONMENT_IS_PTHREAD) { addRunDependency('wasm-instantiate'); }

  // Prefer streaming instantiation if available.
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    receiveInstance(result['instance'], result['module']);
  }

  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise().then(function(binary) {
      return WebAssembly.instantiate(binary, info);
    }).then(function (instance) {
      return instance;
    }).then(receiver, function(reason) {
      err('failed to asynchronously prepare wasm: ' + reason);

      abort(reason);
    });
  }

  function instantiateAsync() {
    if (!wasmBinary &&
        typeof WebAssembly.instantiateStreaming === 'function' &&
        !isDataURI(wasmBinaryFile) &&
        // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
        !isFileURI(wasmBinaryFile) &&
        typeof fetch === 'function') {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
        var result = WebAssembly.instantiateStreaming(response, info);

        return result.then(
          receiveInstantiationResult,
          function(reason) {
            // We expect the most common failure cause to be a bad MIME type for the binary,
            // in which case falling back to ArrayBuffer instantiation should work.
            err('wasm streaming compile failed: ' + reason);
            err('falling back to ArrayBuffer instantiation');
            return instantiateArrayBuffer(receiveInstantiationResult);
          });
      });
    } else {
      return instantiateArrayBuffer(receiveInstantiationResult);
    }
  }

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
  // to any other async startup actions they are performing.
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance);
      return exports;
    } catch(e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
      return false;
    }
  }

  instantiateAsync();
  return {}; // no exports yet; we'll fill them in later
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// === Body ===

var ASM_CONSTS = {
  
};






  function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == 'function') {
          callback(Module); // Pass the module as the first argument.
          continue;
        }
        var func = callback.func;
        if (typeof func === 'number') {
          if (callback.arg === undefined) {
            getWasmTableEntry(func)();
          } else {
            getWasmTableEntry(func)(callback.arg);
          }
        } else {
          func(callback.arg === undefined ? null : callback.arg);
        }
      }
    }

  function withStackSave(f) {
      var stack = stackSave();
      var ret = f();
      stackRestore(stack);
      return ret;
    }
  function demangle(func) {
      return func;
    }

  function demangleAll(text) {
      var regex =
        /\b_Z[\w\d_]+/g;
      return text.replace(regex,
        function(x) {
          var y = demangle(x);
          return x === y ? x : (y + ' [' + x + ']');
        });
    }

  function killThread(pthread_ptr) {
      HEAP32[((pthread_ptr)>>2)] = 0;
      var pthread = PThread.pthreads[pthread_ptr];
      delete PThread.pthreads[pthread_ptr];
      pthread.worker.terminate();
      __emscripten_thread_free_data(pthread_ptr);
      // The worker was completely nuked (not just the pthread execution it was hosting), so remove it from running workers
      // but don't put it back to the pool.
      PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(pthread.worker), 1); // Not a running Worker anymore.
      pthread.worker.pthread = undefined;
    }
  
  function cancelThread(pthread_ptr) {
      var pthread = PThread.pthreads[pthread_ptr];
      pthread.worker.postMessage({ 'cmd': 'cancel' });
    }
  
  function cleanupThread(pthread_ptr) {
      var pthread = PThread.pthreads[pthread_ptr];
      // If pthread has been removed from this map this also means that pthread_ptr points
      // to already freed data. Such situation may occur in following circumstance:
      // Joining thread from non-main browser thread (this also includes thread running main()
      // when compiled with `PROXY_TO_PTHREAD`) - in such situation it may happen that following
      // code flow occur (MB - Main Browser Thread, S1, S2 - Worker Threads):
      // S2: thread ends, 'exit' message is sent to MB
      // S1: calls pthread_join(S2), this causes:
      //     a. S2 is marked as detached,
      //     b. 'cleanupThread' message is sent to MB.
      // MB: handles 'exit' message, as thread is detached, so returnWorkerToPool()
      //     is called and all thread related structs are freed/released.
      // MB: handles 'cleanupThread' message which calls this function.
      if (pthread) {
        HEAP32[((pthread_ptr)>>2)] = 0;
        var worker = pthread.worker;
        PThread.returnWorkerToPool(worker);
      }
    }
  
  function zeroMemory(address, size) {
      HEAPU8.fill(0, address, address + size);
    }
  
  function _exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      exit(status);
    }
  
  function handleException(e) {
      // Certain exception types we do not treat as errors since they are used for
      // internal control flow.
      // 1. ExitStatus, which is thrown by exit()
      // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
      //    that wish to return to JS event loop.
      if (e instanceof ExitStatus || e == 'unwind') {
        return EXITSTATUS;
      }
      quit_(1, e);
    }
  var PThread = {unusedWorkers:[],runningWorkers:[],tlsInitFunctions:[],initMainThread:function() {
  
        var pthreadPoolSize = 4 + Math.max(0, navigator.hardwareConcurrency - (navigator.hardwareConcurrency > 4 ? 3 : 2)) * 2;
        // Start loading up the Worker pool, if requested.
        for (var i = 0; i < pthreadPoolSize; ++i) {
          PThread.allocateUnusedWorker();
        }
      },initWorker:function() {
      },pthreads:{},setExitStatus:function(status) {
        EXITSTATUS = status;
      },terminateAllThreads:function() {
        for (var t in PThread.pthreads) {
          var pthread = PThread.pthreads[t];
          if (pthread && pthread.worker) {
            PThread.returnWorkerToPool(pthread.worker);
          }
        }
  
        for (var i = 0; i < PThread.unusedWorkers.length; ++i) {
          var worker = PThread.unusedWorkers[i];
          worker.terminate();
        }
        PThread.unusedWorkers = [];
      },returnWorkerToPool:function(worker) {
        // We don't want to run main thread queued calls here, since we are doing
        // some operations that leave the worker queue in an invalid state until
        // we are completely done (it would be bad if free() ends up calling a
        // queued pthread_create which looks at the global data structures we are
        // modifying).
        PThread.runWithoutMainThreadQueuedCalls(function() {
          delete PThread.pthreads[worker.pthread.threadInfoStruct];
          // Note: worker is intentionally not terminated so the pool can
          // dynamically grow.
          PThread.unusedWorkers.push(worker);
          PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
          // Not a running Worker anymore
          __emscripten_thread_free_data(worker.pthread.threadInfoStruct);
          // Detach the worker from the pthread object, and return it to the
          // worker pool as an unused worker.
          worker.pthread = undefined;
        });
      },runWithoutMainThreadQueuedCalls:function(func) {
        HEAP32[__emscripten_allow_main_runtime_queued_calls >> 2] = 0;
        try {
          func();
        } finally {
          HEAP32[__emscripten_allow_main_runtime_queued_calls >> 2] = 1;
        }
      },receiveObjectTransfer:function(data) {
      },threadInit:function() {
        // Call thread init functions (these are the emscripten_tls_init for each
        // module loaded.
        for (var i in PThread.tlsInitFunctions) {
          PThread.tlsInitFunctions[i]();
        }
      },loadWasmModuleToWorker:function(worker, onFinishedLoading) {
        worker.onmessage = (e) => {
          var d = e['data'];
          var cmd = d['cmd'];
          // Sometimes we need to backproxy events to the calling thread (e.g.
          // HTML5 DOM events handlers such as
          // emscripten_set_mousemove_callback()), so keep track in a globally
          // accessible variable about the thread that initiated the proxying.
          if (worker.pthread) PThread.currentProxiedOperationCallerThread = worker.pthread.threadInfoStruct;
  
          // If this message is intended to a recipient that is not the main thread, forward it to the target thread.
          if (d['targetThread'] && d['targetThread'] != _pthread_self()) {
            var thread = PThread.pthreads[d.targetThread];
            if (thread) {
              thread.worker.postMessage(d, d['transferList']);
            } else {
              err('Internal error! Worker sent a message "' + cmd + '" to target pthread ' + d['targetThread'] + ', but that thread no longer exists!');
            }
            PThread.currentProxiedOperationCallerThread = undefined;
            return;
          }
  
          if (cmd === 'processQueuedMainThreadWork') {
            // TODO: Must post message to main Emscripten thread in PROXY_TO_WORKER mode.
            _emscripten_main_thread_process_queued_calls();
          } else if (cmd === 'spawnThread') {
            spawnThread(d);
          } else if (cmd === 'cleanupThread') {
            cleanupThread(d['thread']);
          } else if (cmd === 'killThread') {
            killThread(d['thread']);
          } else if (cmd === 'cancelThread') {
            cancelThread(d['thread']);
          } else if (cmd === 'loaded') {
            worker.loaded = true;
            if (onFinishedLoading) onFinishedLoading(worker);
            // If this Worker is already pending to start running a thread, launch the thread now
            if (worker.runPthread) {
              worker.runPthread();
              delete worker.runPthread;
            }
          } else if (cmd === 'print') {
            out('Thread ' + d['threadId'] + ': ' + d['text']);
          } else if (cmd === 'printErr') {
            err('Thread ' + d['threadId'] + ': ' + d['text']);
          } else if (cmd === 'alert') {
            alert('Thread ' + d['threadId'] + ': ' + d['text']);
          } else if (d.target === 'setimmediate') {
            // Worker wants to postMessage() to itself to implement setImmediate()
            // emulation.
            worker.postMessage(d);
          } else if (cmd === 'onAbort') {
            if (Module['onAbort']) {
              Module['onAbort'](d['arg']);
            }
          } else {
            err("worker sent an unknown command " + cmd);
          }
          PThread.currentProxiedOperationCallerThread = undefined;
        };
  
        worker.onerror = (e) => {
          var message = 'worker sent an error!';
          err(message + ' ' + e.filename + ':' + e.lineno + ': ' + e.message);
          throw e;
        };
  
        if (ENVIRONMENT_IS_NODE) {
          worker.on('message', function(data) {
            worker.onmessage({ data: data });
          });
          worker.on('error', function(e) {
            worker.onerror(e);
          });
          worker.on('detachedExit', function() {
            // TODO: update the worker queue?
            // See: https://github.com/emscripten-core/emscripten/issues/9763
          });
        }
  
        // Ask the new worker to load up the Emscripten-compiled page. This is a heavy operation.
        worker.postMessage({
          'cmd': 'load',
          // If the application main .js file was loaded from a Blob, then it is not possible
          // to access the URL of the current script that could be passed to a Web Worker so that
          // it could load up the same file. In that case, developer must either deliver the Blob
          // object in Module['mainScriptUrlOrBlob'], or a URL to it, so that pthread Workers can
          // independently load up the same main application file.
          'urlOrBlob': Module['mainScriptUrlOrBlob']
          || _scriptDir
          ,
          'wasmMemory': wasmMemory,
          'wasmModule': wasmModule,
        });
      },allocateUnusedWorker:function() {
        // Allow HTML module to configure the location where the 'worker.js' file will be loaded from,
        // via Module.locateFile() function. If not specified, then the default URL 'worker.js' relative
        // to the main html file is loaded.
        var pthreadMainJs = locateFile('dotnet.worker.js');
        PThread.unusedWorkers.push(new Worker(pthreadMainJs));
      },getNewWorker:function() {
        if (PThread.unusedWorkers.length == 0) {
  
          PThread.allocateUnusedWorker();
          PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0]);
        }
        return PThread.unusedWorkers.pop();
      }};
  function establishStackSpace() {
      var pthread_ptr = _pthread_self();
      var stackTop = HEAP32[(((pthread_ptr)+(44))>>2)];
      var stackSize = HEAP32[(((pthread_ptr)+(48))>>2)];
      var stackMax = stackTop - stackSize;
      // Set stack limits used by `emscripten/stack.h` function.  These limits are
      // cached in wasm-side globals to make checks as fast as possible.
      _emscripten_stack_set_limits(stackTop, stackMax);
  
      // Call inside wasm module to set up the stack frame for this pthread in wasm module scope
      stackRestore(stackTop);
  
    }
  Module["establishStackSpace"] = establishStackSpace;

  
  function exitOnMainThread(returnCode) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(1, 0, returnCode);
    
      try {
        _exit(returnCode);
      } catch (e) {
        handleException(e);
      }
    
  }
  

  var wasmTableMirror = [];
  function getWasmTableEntry(funcPtr) {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      return func;
    }


  function invokeEntryPoint(ptr, arg) {
      return getWasmTableEntry(ptr)(arg);
    }
  Module["invokeEntryPoint"] = invokeEntryPoint;

  function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
        // so try that as a special-case.
        try {
          throw new Error();
        } catch(e) {
          error = e;
        }
        if (!error.stack) {
          return '(no stack trace available)';
        }
      }
      return error.stack.toString();
    }

  function registerTlsInit(tlsInitFunc, moduleExports, metadata) {
      PThread.tlsInitFunctions.push(tlsInitFunc);
    }

  function setWasmTableEntry(idx, func) {
      wasmTable.set(idx, func);
      wasmTableMirror[idx] = func;
    }

  function stackTrace() {
      var js = jsStackTrace();
      if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
      return demangleAll(js);
    }

  var _emscripten_get_now;if (ENVIRONMENT_IS_NODE) {
    _emscripten_get_now = () => {
      var t = process['hrtime']();
      return t[0] * 1e3 + t[1] / 1e6;
    };
  } else if (ENVIRONMENT_IS_PTHREAD) {
    _emscripten_get_now = () => performance.now() - Module['__performance_now_clock_drift'];
  } else _emscripten_get_now = () => performance.now();
  ;
  
  var _emscripten_get_now_is_monotonic = true;;
  
  function setErrNo(value) {
      HEAP32[((___errno_location())>>2)] = value;
      return value;
    }
  function _clock_gettime(clk_id, tp) {
      // int clock_gettime(clockid_t clk_id, struct timespec *tp);
      var now;
      if (clk_id === 0) {
        now = Date.now();
      } else if ((clk_id === 1 || clk_id === 4) && _emscripten_get_now_is_monotonic) {
        now = _emscripten_get_now();
      } else {
        setErrNo(28);
        return -1;
      }
      HEAP32[((tp)>>2)] = (now/1000)|0; // seconds
      HEAP32[(((tp)+(4))>>2)] = ((now % 1000)*1000*1000)|0; // nanoseconds
      return 0;
    }
  function ___clock_gettime(a0,a1
  ) {
  return _clock_gettime(a0,a1);
  }

  function ___cxa_allocate_exception(size) {
      // Thrown object is prepended by exception metadata block
      return _malloc(size + 16) + 16;
    }

  function ExceptionInfo(excPtr) {
      this.excPtr = excPtr;
      this.ptr = excPtr - 16;
  
      this.set_type = function(type) {
        HEAP32[(((this.ptr)+(4))>>2)] = type;
      };
  
      this.get_type = function() {
        return HEAP32[(((this.ptr)+(4))>>2)];
      };
  
      this.set_destructor = function(destructor) {
        HEAP32[(((this.ptr)+(8))>>2)] = destructor;
      };
  
      this.get_destructor = function() {
        return HEAP32[(((this.ptr)+(8))>>2)];
      };
  
      this.set_refcount = function(refcount) {
        HEAP32[((this.ptr)>>2)] = refcount;
      };
  
      this.set_caught = function (caught) {
        caught = caught ? 1 : 0;
        HEAP8[(((this.ptr)+(12))>>0)] = caught;
      };
  
      this.get_caught = function () {
        return HEAP8[(((this.ptr)+(12))>>0)] != 0;
      };
  
      this.set_rethrown = function (rethrown) {
        rethrown = rethrown ? 1 : 0;
        HEAP8[(((this.ptr)+(13))>>0)] = rethrown;
      };
  
      this.get_rethrown = function () {
        return HEAP8[(((this.ptr)+(13))>>0)] != 0;
      };
  
      // Initialize native structure fields. Should be called once after allocated.
      this.init = function(type, destructor) {
        this.set_type(type);
        this.set_destructor(destructor);
        this.set_refcount(0);
        this.set_caught(false);
        this.set_rethrown(false);
      }
  
      this.add_ref = function() {
        Atomics.add(HEAP32, (this.ptr + 0) >> 2, 1);
      };
  
      // Returns true if last reference released.
      this.release_ref = function() {
        var prev = Atomics.sub(HEAP32, (this.ptr + 0) >> 2, 1);
        return prev === 1;
      };
    }
  function CatchInfo(ptr) {
  
      this.free = function() {
        _free(this.ptr);
        this.ptr = 0;
      };
  
      this.set_base_ptr = function(basePtr) {
        HEAP32[((this.ptr)>>2)] = basePtr;
      };
  
      this.get_base_ptr = function() {
        return HEAP32[((this.ptr)>>2)];
      };
  
      this.set_adjusted_ptr = function(adjustedPtr) {
        HEAP32[(((this.ptr)+(4))>>2)] = adjustedPtr;
      };
  
      this.get_adjusted_ptr_addr = function() {
        return this.ptr + 4;
      }
  
      this.get_adjusted_ptr = function() {
        return HEAP32[(((this.ptr)+(4))>>2)];
      };
  
      // Get pointer which is expected to be received by catch clause in C++ code. It may be adjusted
      // when the pointer is casted to some of the exception object base classes (e.g. when virtual
      // inheritance is used). When a pointer is thrown this method should return the thrown pointer
      // itself.
      this.get_exception_ptr = function() {
        // Work around a fastcomp bug, this code is still included for some reason in a build without
        // exceptions support.
        var isPointer = ___cxa_is_pointer_type(
          this.get_exception_info().get_type());
        if (isPointer) {
          return HEAP32[((this.get_base_ptr())>>2)];
        }
        var adjusted = this.get_adjusted_ptr();
        if (adjusted !== 0) return adjusted;
        return this.get_base_ptr();
      };
  
      this.get_exception_info = function() {
        return new ExceptionInfo(this.get_base_ptr());
      };
  
      if (ptr === undefined) {
        this.ptr = _malloc(8);
        this.set_adjusted_ptr(0);
      } else {
        this.ptr = ptr;
      }
    }
  
  var exceptionCaught =  [];
  
  function exception_addRef(info) {
      info.add_ref();
    }
  
  var uncaughtExceptionCount = 0;
  function ___cxa_begin_catch(ptr) {
      var catchInfo = new CatchInfo(ptr);
      var info = catchInfo.get_exception_info();
      if (!info.get_caught()) {
        info.set_caught(true);
        uncaughtExceptionCount--;
      }
      info.set_rethrown(false);
      exceptionCaught.push(catchInfo);
      exception_addRef(info);
      return catchInfo.get_exception_ptr();
    }

  function ___cxa_current_primary_exception() {
      if (!exceptionCaught.length) {
        return 0;
      }
      var catchInfo = exceptionCaught[exceptionCaught.length - 1];
      exception_addRef(catchInfo.get_exception_info());
      return catchInfo.get_base_ptr();
    }

  function ___cxa_free_exception(ptr) {
      try {
        return _free(new ExceptionInfo(ptr).ptr);
      } catch(e) {
      }
    }
  function exception_decRef(info) {
      // A rethrown exception can reach refcount 0; it must not be discarded
      // Its next handler will clear the rethrown flag and addRef it, prior to
      // final decRef and destruction here
      if (info.release_ref() && !info.get_rethrown()) {
        var destructor = info.get_destructor();
        if (destructor) {
          // In Wasm, destructors return 'this' as in ARM
          getWasmTableEntry(destructor)(info.excPtr);
        }
        ___cxa_free_exception(info.excPtr);
      }
    }
  function ___cxa_decrement_exception_refcount(ptr) {
      if (!ptr) return;
      exception_decRef(new ExceptionInfo(ptr));
    }

  var exceptionLast = 0;
  function ___cxa_end_catch() {
      // Clear state flag.
      _setThrew(0);
      // Call destructor if one is registered then clear it.
      var catchInfo = exceptionCaught.pop();
  
      exception_decRef(catchInfo.get_exception_info());
      catchInfo.free();
      exceptionLast = 0; // XXX in decRef?
    }

  function ___resumeException(catchInfoPtr) {
      var catchInfo = new CatchInfo(catchInfoPtr);
      var ptr = catchInfo.get_base_ptr();
      if (!exceptionLast) { exceptionLast = ptr; }
      catchInfo.free();
      throw ptr;
    }
  function ___cxa_find_matching_catch_2() {
      var thrown = exceptionLast;
      if (!thrown) {
        // just pass through the null ptr
        setTempRet0(0); return ((0)|0);
      }
      var info = new ExceptionInfo(thrown);
      var thrownType = info.get_type();
      var catchInfo = new CatchInfo();
      catchInfo.set_base_ptr(thrown);
      catchInfo.set_adjusted_ptr(thrown);
      if (!thrownType) {
        // just pass through the thrown ptr
        setTempRet0(0); return ((catchInfo.ptr)|0);
      }
      var typeArray = Array.prototype.slice.call(arguments);
  
      // can_catch receives a **, add indirection
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        var caughtType = typeArray[i];
        if (caughtType === 0 || caughtType === thrownType) {
          // Catch all clause matched or exactly the same type is caught
          break;
        }
        if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
          setTempRet0(caughtType); return ((catchInfo.ptr)|0);
        }
      }
      setTempRet0(thrownType); return ((catchInfo.ptr)|0);
    }

  function ___cxa_find_matching_catch_3() {
      var thrown = exceptionLast;
      if (!thrown) {
        // just pass through the null ptr
        setTempRet0(0); return ((0)|0);
      }
      var info = new ExceptionInfo(thrown);
      var thrownType = info.get_type();
      var catchInfo = new CatchInfo();
      catchInfo.set_base_ptr(thrown);
      catchInfo.set_adjusted_ptr(thrown);
      if (!thrownType) {
        // just pass through the thrown ptr
        setTempRet0(0); return ((catchInfo.ptr)|0);
      }
      var typeArray = Array.prototype.slice.call(arguments);
  
      // can_catch receives a **, add indirection
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        var caughtType = typeArray[i];
        if (caughtType === 0 || caughtType === thrownType) {
          // Catch all clause matched or exactly the same type is caught
          break;
        }
        if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
          setTempRet0(caughtType); return ((catchInfo.ptr)|0);
        }
      }
      setTempRet0(thrownType); return ((catchInfo.ptr)|0);
    }

  function ___cxa_find_matching_catch_4() {
      var thrown = exceptionLast;
      if (!thrown) {
        // just pass through the null ptr
        setTempRet0(0); return ((0)|0);
      }
      var info = new ExceptionInfo(thrown);
      var thrownType = info.get_type();
      var catchInfo = new CatchInfo();
      catchInfo.set_base_ptr(thrown);
      catchInfo.set_adjusted_ptr(thrown);
      if (!thrownType) {
        // just pass through the thrown ptr
        setTempRet0(0); return ((catchInfo.ptr)|0);
      }
      var typeArray = Array.prototype.slice.call(arguments);
  
      // can_catch receives a **, add indirection
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        var caughtType = typeArray[i];
        if (caughtType === 0 || caughtType === thrownType) {
          // Catch all clause matched or exactly the same type is caught
          break;
        }
        if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
          setTempRet0(caughtType); return ((catchInfo.ptr)|0);
        }
      }
      setTempRet0(thrownType); return ((catchInfo.ptr)|0);
    }

  function ___cxa_find_matching_catch_5() {
      var thrown = exceptionLast;
      if (!thrown) {
        // just pass through the null ptr
        setTempRet0(0); return ((0)|0);
      }
      var info = new ExceptionInfo(thrown);
      var thrownType = info.get_type();
      var catchInfo = new CatchInfo();
      catchInfo.set_base_ptr(thrown);
      catchInfo.set_adjusted_ptr(thrown);
      if (!thrownType) {
        // just pass through the thrown ptr
        setTempRet0(0); return ((catchInfo.ptr)|0);
      }
      var typeArray = Array.prototype.slice.call(arguments);
  
      // can_catch receives a **, add indirection
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        var caughtType = typeArray[i];
        if (caughtType === 0 || caughtType === thrownType) {
          // Catch all clause matched or exactly the same type is caught
          break;
        }
        if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
          setTempRet0(caughtType); return ((catchInfo.ptr)|0);
        }
      }
      setTempRet0(thrownType); return ((catchInfo.ptr)|0);
    }


  function ___cxa_increment_exception_refcount(ptr) {
      if (!ptr) return;
      exception_addRef(new ExceptionInfo(ptr));
    }

  function ___cxa_rethrow() {
      var catchInfo = exceptionCaught.pop();
      if (!catchInfo) {
        abort('no exception to throw');
      }
      var info = catchInfo.get_exception_info();
      var ptr = catchInfo.get_base_ptr();
      if (!info.get_rethrown()) {
        // Only pop if the corresponding push was through rethrow_primary_exception
        exceptionCaught.push(catchInfo);
        info.set_rethrown(true);
        info.set_caught(false);
        uncaughtExceptionCount++;
      } else {
        catchInfo.free();
      }
      exceptionLast = ptr;
      throw ptr;
    }

  function ___cxa_rethrow_primary_exception(ptr) {
      if (!ptr) return;
      var catchInfo = new CatchInfo();
      catchInfo.set_base_ptr(ptr);
      var info = catchInfo.get_exception_info();
      exceptionCaught.push(catchInfo);
      info.set_rethrown(true);
      ___cxa_rethrow();
    }

  function ___cxa_throw(ptr, type, destructor) {
      var info = new ExceptionInfo(ptr);
      // Initialize ExceptionInfo content after it was allocated in __cxa_allocate_exception.
      info.init(type, destructor);
      exceptionLast = ptr;
      uncaughtExceptionCount++;
      throw ptr;
    }

  function ___cxa_uncaught_exceptions() {
      return uncaughtExceptionCount;
    }

  function ___emscripten_init_main_thread_js(tb) {
      // Pass the thread address to the native code where they stored in wasm
      // globals which act as a form of TLS. Global constructors trying
      // to access this value will read the wrong value, but that is UB anyway.
      __emscripten_thread_init(
        tb,
        /*isMainBrowserThread=*/!ENVIRONMENT_IS_WORKER,
        /*isMainRuntimeThread=*/1,
        /*canBlock=*/!ENVIRONMENT_IS_WEB,
      );
      PThread.threadInit();
    }

  function ___emscripten_thread_cleanup(thread) {
      // Called when a thread needs to be cleaned up so it can be reused.
      // A thread is considered reusable when it either returns from its
      // entry point, calls pthread_exit, or acts upon a cancellation.
      // Detached threads are responsible for calling this themselves,
      // otherwise pthread_join is responsible for calling this.
      if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread);
      else postMessage({ 'cmd': 'cleanupThread', 'thread': thread });
    }

  function spawnThread(threadParams) {
  
      var worker = PThread.getNewWorker();
      if (!worker) {
        // No available workers in the PThread pool.
        return 6;
      }
  
      PThread.runningWorkers.push(worker);
  
      // Create a pthread info object to represent this thread.
      var pthread = PThread.pthreads[threadParams.pthread_ptr] = {
        worker: worker,
        // Info area for this thread in Emscripten HEAP (shared)
        threadInfoStruct: threadParams.pthread_ptr
      };
  
      worker.pthread = pthread;
      var msg = {
          'cmd': 'run',
          'start_routine': threadParams.startRoutine,
          'arg': threadParams.arg,
          'threadInfoStruct': threadParams.pthread_ptr,
      };
      worker.runPthread = () => {
        // Ask the worker to start executing its pthread entry point function.
        msg.time = performance.now();
        worker.postMessage(msg, threadParams.transferList);
      };
      if (worker.loaded) {
        worker.runPthread();
        delete worker.runPthread;
      }
      return 0;
    }
  function ___pthread_create_js(pthread_ptr, attr, start_routine, arg) {
      if (typeof SharedArrayBuffer === 'undefined') {
        err('Current environment does not support SharedArrayBuffer, pthreads are not available!');
        return 6;
      }
  
      // List of JS objects that will transfer ownership to the Worker hosting the thread
      var transferList = [];
      var error = 0;
  
      // Synchronously proxy the thread creation to main thread if possible. If we
      // need to transfer ownership of objects, then proxy asynchronously via
      // postMessage.
      if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
        return _emscripten_sync_run_in_main_thread_4(687865856, pthread_ptr, attr, start_routine, arg);
      }
  
      // If on the main thread, and accessing Canvas/OffscreenCanvas failed, abort
      // with the detected error.
      if (error) return error;
  
      var threadParams = {
        startRoutine: start_routine,
        pthread_ptr: pthread_ptr,
        arg: arg,
        transferList: transferList
      };
  
      if (ENVIRONMENT_IS_PTHREAD) {
        // The prepopulated pool of web workers that can host pthreads is stored
        // in the main JS thread. Therefore if a pthread is attempting to spawn a
        // new thread, the thread creation must be deferred to the main JS thread.
        threadParams.cmd = 'spawnThread';
        postMessage(threadParams, transferList);
        // When we defer thread creation this way, we have no way to detect thread
        // creation synchronously today, so we have to assume success and return 0.
        return 0;
      }
  
      // We are the main thread, so we have the pthread warmup pool in this
      // thread and can fire off JS thread creation directly ourselves.
      return spawnThread(threadParams);
    }


  var PATH = {splitPath:function(filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function(parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up; up--) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function(path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function(path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function(path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        path = PATH.normalize(path);
        path = path.replace(/\/$/, "");
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function(path) {
        return PATH.splitPath(path)[3];
      },join:function() {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function(l, r) {
        return PATH.normalize(l + '/' + r);
      }};
  
  function getRandomDevice() {
      if (typeof crypto === 'object' && typeof crypto['getRandomValues'] === 'function') {
        // for modern web browsers
        var randomBuffer = new Uint8Array(1);
        return function() { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; };
      } else
      if (ENVIRONMENT_IS_NODE) {
        // for nodejs with or without crypto support included
        try {
          var crypto_module = require('crypto');
          // nodejs has crypto support
          return function() { return crypto_module['randomBytes'](1)[0]; };
        } catch (e) {
          // nodejs doesn't have crypto support
        }
      }
      // we couldn't find a proper implementation, as Math.random() is not suitable for /dev/random, see emscripten-core/emscripten/pull/7096
      return function() { abort("randomDevice"); };
    }
  
  var PATH_FS = {resolve:function() {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function(from, to) {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY = {ttys:[],init:function () {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function() {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function(dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function(stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(43);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function(stream) {
          // flush any pending line data
          stream.tty.ops.flush(stream.tty);
        },flush:function(stream) {
          stream.tty.ops.flush(stream.tty);
        },read:function(stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(60);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(6);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function(stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(60);
          }
          try {
            for (var i = 0; i < length; i++) {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            }
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function(tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              // we will read data by chunks of BUFSIZE
              var BUFSIZE = 256;
              var buf = Buffer.alloc(BUFSIZE);
              var bytesRead = 0;
  
              try {
                bytesRead = fs.readSync(process.stdin.fd, buf, 0, BUFSIZE, null);
              } catch(e) {
                // Cross-platform differences: on Windows, reading EOF throws an exception, but on other OSes,
                // reading EOF returns 0. Uniformize behavior by treating the EOF exception to return 0.
                if (e.toString().includes('EOF')) bytesRead = 0;
                else throw e;
              }
  
              if (bytesRead > 0) {
                result = buf.slice(0, bytesRead).toString('utf-8');
              } else {
                result = null;
              }
            } else
            if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function(tty, val) {
          if (val === null || val === 10) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
          }
        },flush:function(tty) {
          if (tty.output && tty.output.length > 0) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }},default_tty1_ops:{put_char:function(tty, val) {
          if (val === null || val === 10) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },flush:function(tty) {
          if (tty.output && tty.output.length > 0) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }}};
  
  function alignMemory(size, alignment) {
      return Math.ceil(size / alignment) * alignment;
    }
  function mmapAlloc(size) {
      size = alignMemory(size, 65536);
      var ptr = _memalign(65536, size);
      if (!ptr) return 0;
      zeroMemory(ptr, size);
      return ptr;
    }
  var MEMFS = {ops_table:null,mount:function(mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function(parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(63);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap,
                msync: MEMFS.stream_ops.msync
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            }
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
          parent.timestamp = node.timestamp;
        }
        return node;
      },getFileDataAsTypedArray:function(node) {
        if (!node.contents) return new Uint8Array(0);
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },expandFileStorage:function(node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
        // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
        // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
        // avoid overshooting the allocation cap by a very large margin.
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) >>> 0);
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity); // Allocate new storage.
        if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
      },resizeFileStorage:function(node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
        } else {
          var oldContents = node.contents;
          node.contents = new Uint8Array(newSize); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
        }
      },node_ops:{getattr:function(node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function(node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },lookup:function(parent, name) {
          throw FS.genericErrors[44];
        },mknod:function(parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function(old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(55);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.parent.timestamp = Date.now()
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          new_dir.timestamp = old_node.parent.timestamp;
          old_node.parent = new_dir;
        },unlink:function(parent, name) {
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },rmdir:function(parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(55);
          }
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },readdir:function(node) {
          var entries = ['.', '..'];
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function(parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function(node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(28);
          }
          return node.link;
        }},stream_ops:{read:function(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },write:function(stream, buffer, offset, length, position, canOwn) {
  
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) {
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = buffer.slice(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
  
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) {
            // Use typed array write which is available.
            node.contents.set(buffer.subarray(offset, offset + length), position);
          } else {
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          }
          node.usedBytes = Math.max(node.usedBytes, position + length);
          return length;
        },llseek:function(stream, offset, whence) {
          var position = offset;
          if (whence === 1) {
            position += stream.position;
          } else if (whence === 2) {
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(28);
          }
          return position;
        },allocate:function(stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },mmap:function(stream, address, length, position, prot, flags) {
          if (address !== 0) {
            // We don't currently support location hints for the address of the mapping
            throw new FS.ErrnoError(28);
          }
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if (!(flags & 2) && contents.buffer === buffer) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = mmapAlloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(48);
            }
            HEAP8.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        },msync:function(stream, buffer, offset, length, mmapFlags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          if (mmapFlags & 2) {
            // MAP_PRIVATE calls need not to be synced back to underlying fs
            return 0;
          }
  
          var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
          // should we check if bytesWritten and length are the same?
          return 0;
        }}};
  
  function asyncLoad(url, onload, onerror, noRunDep) {
      var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : '';
      readAsync(url, function(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
        onload(new Uint8Array(arrayBuffer));
        if (dep) removeRunDependency(dep);
      }, function(event) {
        if (onerror) {
          onerror();
        } else {
          throw 'Loading data file "' + url + '" failed.';
        }
      });
      if (dep) addRunDependency(dep);
    }
  var FS = {root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},filesystems:null,syncFSRequests:0,lookupPath:function(path, opts = {}) {
        path = PATH_FS.resolve(FS.cwd(), path);
  
        if (!path) return { path: '', node: null };
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(32);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
  
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(32);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function(node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function(parentid, name) {
        var hash = 0;
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function(parent, name) {
        var errCode = FS.mayLookup(parent);
        if (errCode) {
          throw new FS.ErrnoError(errCode, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function(parent, name, mode, rdev) {
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function(node) {
        FS.hashRemoveNode(node);
      },isRoot:function(node) {
        return node === node.parent;
      },isMountpoint:function(node) {
        return !!node.mounted;
      },isFile:function(mode) {
        return (mode & 61440) === 32768;
      },isDir:function(mode) {
        return (mode & 61440) === 16384;
      },isLink:function(mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function(mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function(mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function(mode) {
        return (mode & 61440) === 4096;
      },isSocket:function(mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"r+":2,"w":577,"w+":578,"a":1089,"a+":1090},modeStringToFlags:function(str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function(flag) {
        var perms = ['r', 'w', 'rw'][flag & 3];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function(node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.includes('r') && !(node.mode & 292)) {
          return 2;
        } else if (perms.includes('w') && !(node.mode & 146)) {
          return 2;
        } else if (perms.includes('x') && !(node.mode & 73)) {
          return 2;
        }
        return 0;
      },mayLookup:function(dir) {
        var errCode = FS.nodePermissions(dir, 'x');
        if (errCode) return errCode;
        if (!dir.node_ops.lookup) return 2;
        return 0;
      },mayCreate:function(dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return 20;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function(dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var errCode = FS.nodePermissions(dir, 'wx');
        if (errCode) {
          return errCode;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return 54;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return 10;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return 31;
          }
        }
        return 0;
      },mayOpen:function(node, flags) {
        if (!node) {
          return 44;
        }
        if (FS.isLink(node.mode)) {
          return 32;
        } else if (FS.isDir(node.mode)) {
          if (FS.flagsToPermissionString(flags) !== 'r' || // opening for write
              (flags & 512)) { // TODO: check for O_SEARCH? (== search for dir only)
            return 31;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function(fd_start = 0, fd_end = FS.MAX_OPEN_FDS) {
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(33);
      },getStream:function(fd) {
        return FS.streams[fd];
      },createStream:function(stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = /** @constructor */ function(){};
          FS.FSStream.prototype = {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          };
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function(fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function(stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function() {
          throw new FS.ErrnoError(70);
        }},major:function(dev) {
        return ((dev) >> 8);
      },minor:function(dev) {
        return ((dev) & 0xff);
      },makedev:function(ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function(dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function(dev) {
        return FS.devices[dev];
      },getMounts:function(mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function(populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        FS.syncFSRequests++;
  
        if (FS.syncFSRequests > 1) {
          err('warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work');
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function doCallback(errCode) {
          FS.syncFSRequests--;
          return callback(errCode);
        }
  
        function done(errCode) {
          if (errCode) {
            if (!done.errored) {
              done.errored = true;
              return doCallback(errCode);
            }
            return;
          }
          if (++completed >= mounts.length) {
            doCallback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function(type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(10);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(28);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.includes(current.mount)) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        node.mount.mounts.splice(idx, 1);
      },lookup:function(parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function(path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.mayCreate(parent, name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function(path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function(path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdirTree:function(path, mode) {
        var dirs = path.split('/');
        var d = '';
        for (var i = 0; i < dirs.length; ++i) {
          if (!dirs[i]) continue;
          d += '/' + dirs[i];
          try {
            FS.mkdir(d, mode);
          } catch(e) {
            if (e.errno != 20) throw e;
          }
        }
      },mkdev:function(path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function(oldpath, newpath) {
        if (!PATH_FS.resolve(oldpath)) {
          throw new FS.ErrnoError(44);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var newname = PATH.basename(newpath);
        var errCode = FS.mayCreate(parent, newname);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function(old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
  
        // let the errors from non existant directories percolate up
        lookup = FS.lookupPath(old_path, { parent: true });
        old_dir = lookup.node;
        lookup = FS.lookupPath(new_path, { parent: true });
        new_dir = lookup.node;
  
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(75);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(28);
        }
        // new path should not be an ancestor of the old path
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(55);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        errCode = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(10);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          errCode = FS.nodePermissions(old_dir, 'w');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(54);
        }
        return node.node_ops.readdir(node);
      },unlink:function(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
          // According to POSIX, we should map EISDIR to EPERM, but
          // we instead do what Linux does (and we must, as we use
          // the musl linux libc).
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function(path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(44);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(28);
        }
        return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
      },stat:function(path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(63);
        }
        return node.node_ops.getattr(node);
      },lstat:function(path) {
        return FS.stat(path, true);
      },chmod:function(path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function(path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function(fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        FS.chmod(stream.node, mode);
      },chown:function(path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function(path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function(fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function(path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(28);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.nodePermissions(node, 'w');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function(fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(28);
        }
        FS.truncate(stream.node, len);
      },utime:function(path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function(path, flags, mode, fd_start, fd_end) {
        if (path === "") {
          throw new FS.ErrnoError(44);
        }
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(20);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // if asked only for a directory, then this must be one
        if ((flags & 65536) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var errCode = FS.mayOpen(node, flags);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512 | 131072);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          id: node.id,
          flags: flags,
          mode: node.mode,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          node_ops: node.node_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
          }
        }
        return stream;
      },close:function(stream) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (stream.getdents) stream.getdents = null; // free readdir state
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
        stream.fd = null;
      },isClosed:function(stream) {
        return stream.fd === null;
      },llseek:function(stream, offset, whence) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(70);
        }
        if (whence != 0 && whence != 1 && whence != 2) {
          throw new FS.ErrnoError(28);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
      },read:function(stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(28);
        }
        var seeking = typeof position !== 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function(stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(28);
        }
        if (stream.seekable && stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position !== 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function(stream, offset, length) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(28);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(138);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function(stream, address, length, position, prot, flags) {
        // User requests writing to file (prot & PROT_WRITE != 0).
        // Checking if we have permissions to write to the file unless
        // MAP_PRIVATE flag is set. According to POSIX spec it is possible
        // to write to file opened in read-only mode with MAP_PRIVATE flag,
        // as all modifications will be visible only in the memory of
        // the current process.
        if ((prot & 2) !== 0
            && (flags & 2) === 0
            && (stream.flags & 2097155) !== 2) {
          throw new FS.ErrnoError(2);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(2);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(43);
        }
        return stream.stream_ops.mmap(stream, address, length, position, prot, flags);
      },msync:function(stream, buffer, offset, length, mmapFlags) {
        if (!stream || !stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
      },munmap:function(stream) {
        return 0;
      },ioctl:function(stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(59);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function(path, opts = {}) {
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = UTF8ArrayToString(buf, 0);
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function(path, data, opts = {}) {
        opts.flags = opts.flags || 577;
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data === 'string') {
          var buf = new Uint8Array(lengthBytesUTF8(data)+1);
          var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
          FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
          FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
          throw new Error('Unsupported data type');
        }
        FS.close(stream);
      },cwd:function() {
        return FS.currentPath;
      },chdir:function(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (lookup.node === null) {
          throw new FS.ErrnoError(44);
        }
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(54);
        }
        var errCode = FS.nodePermissions(lookup.node, 'x');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function() {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },createDefaultDevices:function() {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function(stream, buffer, offset, length, pos) { return length; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using err() rather than out()
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        var random_device = getRandomDevice();
        FS.createDevice('/dev', 'random', random_device);
        FS.createDevice('/dev', 'urandom', random_device);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createSpecialDirectories:function() {
        // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
        // name of the stream for fd 6 (see test_unistd_ttyname)
        FS.mkdir('/proc');
        var proc_self = FS.mkdir('/proc/self');
        FS.mkdir('/proc/self/fd');
        FS.mount({
          mount: function() {
            var node = FS.createNode(proc_self, 'fd', 16384 | 511 /* 0777 */, 73);
            node.node_ops = {
              lookup: function(parent, name) {
                var fd = +name;
                var stream = FS.getStream(fd);
                if (!stream) throw new FS.ErrnoError(8);
                var ret = {
                  parent: null,
                  mount: { mountpoint: 'fake' },
                  node_ops: { readlink: function() { return stream.path } }
                };
                ret.parent = ret; // make it look like a simple root node
                return ret;
              }
            };
            return node;
          }
        }, {}, '/proc/self/fd');
      },createStandardStreams:function() {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 0);
        var stdout = FS.open('/dev/stdout', 1);
        var stderr = FS.open('/dev/stderr', 1);
      },ensureErrnoError:function() {
        if (FS.ErrnoError) return;
        FS.ErrnoError = /** @this{Object} */ function ErrnoError(errno, node) {
          this.node = node;
          this.setErrno = /** @this{Object} */ function(errno) {
            this.errno = errno;
          };
          this.setErrno(errno);
          this.message = 'FS error';
  
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [44].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function() {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
  
        FS.filesystems = {
          'MEMFS': MEMFS,
        };
      },init:function(input, output, error) {
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function() {
        FS.init.initialized = false;
        // force-flush all streams, so we get musl std streams printed out
        // close all of our streams
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function(canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },findObject:function(path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          return null;
        }
      },analyzePath:function(path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createPath:function(parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function(parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function(parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 577);
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function(parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(6);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },forceLoadFile:function(obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (read_) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(read_(obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
      },createLazyFile:function(parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        /** @constructor */
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = /** @this{Object} */ function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = (idx / this.chunkSize)|0;
          return this.getter(chunkNum)[chunkOffset];
        };
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        };
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
  
          var chunkSize = 1024*1024; // Chunk size in bytes
  
          if (!hasByteServing) chunkSize = datalength;
  
          // Function to get a range from the remote URL.
          var doXHR = (function(from, to) {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
            // Some hints to the browser that we want binary data.
            if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
  
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(/** @type{Array<number>} */(xhr.response || []));
            } else {
              return intArrayFromString(xhr.responseText || '', true);
            }
          });
          var lazyArray = this;
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * chunkSize;
            var end = (chunkNum+1) * chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
  
          if (usesGzip || !datalength) {
            // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
            chunkSize = datalength = 1; // this will force getter(0)/doXHR do download the whole file
            datalength = this.getter(0).length;
            chunkSize = datalength;
            out("LazyFiles on gzip forces download of the whole file when length is accessed");
          }
  
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        };
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperties(lazyArray, {
            length: {
              get: /** @this{Object} */ function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._length;
              }
            },
            chunkSize: {
              get: /** @this{Object} */ function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._chunkSize;
              }
            }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperties(node, {
          usedBytes: {
            get: /** @this {FSNode} */ function() { return this.contents.length; }
          }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            FS.forceLoadFile(node);
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          FS.forceLoadFile(node);
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
        Browser.init(); // XXX perhaps this method should move onto Browser?
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency('cp ' + fullname); // might have several active requests for the same fullname
        function processData(byteArray) {
          function finish(byteArray) {
            if (preFinish) preFinish();
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency(dep);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency(dep);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency(dep);
        if (typeof url == 'string') {
          asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function() {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function() {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function(paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          out('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function(paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  var SYSCALLS = {mappings:{},DEFAULT_POLLMASK:5,calculateAt:function(dirfd, path, allowEmpty) {
        if (path[0] === '/') {
          return path;
        }
        // relative path
        var dir;
        if (dirfd === -100) {
          dir = FS.cwd();
        } else {
          var dirstream = FS.getStream(dirfd);
          if (!dirstream) throw new FS.ErrnoError(8);
          dir = dirstream.path;
        }
        if (path.length == 0) {
          if (!allowEmpty) {
            throw new FS.ErrnoError(44);;
          }
          return dir;
        }
        return PATH.join2(dir, path);
      },doStat:function(func, path, buf) {
        try {
          var stat = func(path);
        } catch (e) {
          if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
            // an error occurred while trying to look up the path; we should just report ENOTDIR
            return -54;
          }
          throw e;
        }
        HEAP32[((buf)>>2)] = stat.dev;
        HEAP32[(((buf)+(4))>>2)] = 0;
        HEAP32[(((buf)+(8))>>2)] = stat.ino;
        HEAP32[(((buf)+(12))>>2)] = stat.mode;
        HEAP32[(((buf)+(16))>>2)] = stat.nlink;
        HEAP32[(((buf)+(20))>>2)] = stat.uid;
        HEAP32[(((buf)+(24))>>2)] = stat.gid;
        HEAP32[(((buf)+(28))>>2)] = stat.rdev;
        HEAP32[(((buf)+(32))>>2)] = 0;
        (tempI64 = [stat.size>>>0,(tempDouble=stat.size,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(40))>>2)] = tempI64[0],HEAP32[(((buf)+(44))>>2)] = tempI64[1]);
        HEAP32[(((buf)+(48))>>2)] = 4096;
        HEAP32[(((buf)+(52))>>2)] = stat.blocks;
        HEAP32[(((buf)+(56))>>2)] = (stat.atime.getTime() / 1000)|0;
        HEAP32[(((buf)+(60))>>2)] = 0;
        HEAP32[(((buf)+(64))>>2)] = (stat.mtime.getTime() / 1000)|0;
        HEAP32[(((buf)+(68))>>2)] = 0;
        HEAP32[(((buf)+(72))>>2)] = (stat.ctime.getTime() / 1000)|0;
        HEAP32[(((buf)+(76))>>2)] = 0;
        (tempI64 = [stat.ino>>>0,(tempDouble=stat.ino,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(80))>>2)] = tempI64[0],HEAP32[(((buf)+(84))>>2)] = tempI64[1]);
        return 0;
      },doMsync:function(addr, stream, len, flags, offset) {
        var buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags);
      },doMkdir:function(path, mode) {
        // remove a trailing slash, if one - /a/b/ has basename of '', but
        // we want to create b in the context of this function
        path = PATH.normalize(path);
        if (path[path.length-1] === '/') path = path.substr(0, path.length-1);
        FS.mkdir(path, mode, 0);
        return 0;
      },doMknod:function(path, mode, dev) {
        // we don't want this in the JS API as it uses mknod to create all nodes.
        switch (mode & 61440) {
          case 32768:
          case 8192:
          case 24576:
          case 4096:
          case 49152:
            break;
          default: return -28;
        }
        FS.mknod(path, mode, dev);
        return 0;
      },doReadlink:function(path, buf, bufsize) {
        if (bufsize <= 0) return -28;
        var ret = FS.readlink(path);
  
        var len = Math.min(bufsize, lengthBytesUTF8(ret));
        var endChar = HEAP8[buf+len];
        stringToUTF8(ret, buf, bufsize+1);
        // readlink is one of the rare functions that write out a C string, but does never append a null to the output buffer(!)
        // stringToUTF8() always appends a null byte, so restore the character under the null byte after the write.
        HEAP8[buf+len] = endChar;
  
        return len;
      },doAccess:function(path, amode) {
        if (amode & ~7) {
          // need a valid mode
          return -28;
        }
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node) {
          return -44;
        }
        var perms = '';
        if (amode & 4) perms += 'r';
        if (amode & 2) perms += 'w';
        if (amode & 1) perms += 'x';
        if (perms /* otherwise, they've just passed F_OK */ && FS.nodePermissions(node, perms)) {
          return -2;
        }
        return 0;
      },doDup:function(path, flags, suggestFD) {
        var suggest = FS.getStream(suggestFD);
        if (suggest) FS.close(suggest);
        return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
      },doReadv:function(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAP32[(((iov)+(i*8))>>2)];
          var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
          var curr = FS.read(stream, HEAP8,ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
          if (curr < len) break; // nothing more to read
        }
        return ret;
      },doWritev:function(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAP32[(((iov)+(i*8))>>2)];
          var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
          var curr = FS.write(stream, HEAP8,ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
        }
        return ret;
      },varargs:undefined,get:function() {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(((SYSCALLS.varargs)-(4))>>2)];
        return ret;
      },getStr:function(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },getStreamFromFD:function(fd) {
        var stream = FS.getStream(fd);
        if (!stream) throw new FS.ErrnoError(8);
        return stream;
      },get64:function(low, high) {
        return low;
      }};
  
  function ___syscall_access(path, amode) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(2, 1, path, amode);
    try {
  
      path = SYSCALLS.getStr(path);
      return SYSCALLS.doAccess(path, amode);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_chdir(path) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(3, 1, path);
    try {
  
      path = SYSCALLS.getStr(path);
      FS.chdir(path);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_chmod(path, mode) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(4, 1, path, mode);
    try {
  
      path = SYSCALLS.getStr(path);
      FS.chmod(path, mode);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  var SOCKFS = {mount:function(mount) {
        // If Module['websocket'] has already been defined (e.g. for configuring
        // the subprotocol/url) use that, if not initialise it to a new object.
        Module['websocket'] = (Module['websocket'] && 
                               ('object' === typeof Module['websocket'])) ? Module['websocket'] : {};
  
        // Add the Event registration mechanism to the exported websocket configuration
        // object so we can register network callbacks from native JavaScript too.
        // For more documentation see system/include/emscripten/emscripten.h
        Module['websocket']._callbacks = {};
        Module['websocket']['on'] = /** @this{Object} */ function(event, callback) {
          if ('function' === typeof callback) {
            this._callbacks[event] = callback;
          }
          return this;
        };
  
        Module['websocket'].emit = /** @this{Object} */ function(event, param) {
          if ('function' === typeof this._callbacks[event]) {
            this._callbacks[event].call(this, param);
          }
        };
  
        // If debug is enabled register simple default logging callbacks for each Event.
  
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function(family, type, protocol) {
        type &= ~526336; // Some applications may pass it; it makes no sense for a single process.
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          error: null, // Used in getsockopt for SOL_SOCKET/SO_ERROR test
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: 2,
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function(fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function(stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function(stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function(stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function(stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function(stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function() {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function(sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              // runtimeConfig gets set to true if WebSocket runtime configuration is available.
              var runtimeConfig = (Module['websocket'] && ('object' === typeof Module['websocket']));
  
              // The default value is 'ws://' the replace is needed because the compiler replaces '//' comments with '#'
              // comments without checking context, so we'd end up with ws:#, the replace swaps the '#' for '//' again.
              var url = 'ws:#'.replace('#', '//');
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['url']) {
                  url = Module['websocket']['url']; // Fetch runtime WebSocket URL config.
                }
              }
  
              if (url === 'ws://' || url === 'wss://') { // Is the supplied URL config just a prefix, if so complete it.
                var parts = addr.split('/');
                url = url + parts[0] + ":" + port + "/" + parts.slice(1).join('/');
              }
  
              // Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
              var subProtocols = 'binary'; // The default value is 'binary'
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['subprotocol']) {
                  subProtocols = Module['websocket']['subprotocol']; // Fetch runtime WebSocket subprotocol config.
                }
              }
  
              // The default WebSocket options
              var opts = undefined;
  
              if (subProtocols !== 'null') {
                // The regex trims the string (removes spaces at the beginning and end, then splits the string by
                // <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
                subProtocols = subProtocols.replace(/^ +| +$/g,"").split(/ *, */);
  
                // The node ws library API for specifying optional subprotocol is slightly different than the browser's.
                opts = ENVIRONMENT_IS_NODE ? {'protocol': subProtocols.toString()} : subProtocols;
              }
  
              // some webservers (azure) does not support subprotocol header
              if (runtimeConfig && null === Module['websocket']['subprotocol']) {
                subProtocols = 'null';
                opts = undefined;
              }
  
              // If node we use the ws library.
              var WebSocketConstructor;
              if (ENVIRONMENT_IS_NODE) {
                WebSocketConstructor = /** @type{(typeof WebSocket)} */(require('ws'));
              } else
              {
                WebSocketConstructor = WebSocket;
              }
              ws = new WebSocketConstructor(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(23);
            }
          }
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function(sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function(sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function(sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function(sock, peer) {
          var first = true;
  
          var handleOpen = function () {
  
            Module['websocket'].emit('open', sock.stream.fd);
  
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            if (typeof data === 'string') {
              var encoder = new TextEncoder(); // should be utf-8
              data = encoder.encode(data); // make a typed array from the string
            } else {
              assert(data.byteLength !== undefined); // must receive an ArrayBuffer
              if (data.byteLength == 0) {
                // An empty ArrayBuffer will emit a pseudo disconnect event
                // as recv/recvmsg will return zero which indicates that a socket
                // has performed a shutdown although the connection has not been disconnected yet.
                return;
              } else {
                data = new Uint8Array(data); // make a typed array view on the array buffer
              }
            }
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
            Module['websocket'].emit('message', sock.stream.fd);
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('close', function() {
              Module['websocket'].emit('close', sock.stream.fd);
            });
            peer.socket.on('error', function(error) {
              // Although the ws library may pass errors that may be more descriptive than
              // ECONNREFUSED they are not necessarily the expected error code e.g. 
              // ENOTFOUND on getaddrinfo seems to be node.js specific, so using ECONNREFUSED
              // is still probably the most useful thing to do.
              sock.error = 14; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
              Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'ECONNREFUSED: Connection refused']);
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onclose = function() {
              Module['websocket'].emit('close', sock.stream.fd);
            };
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
            peer.socket.onerror = function(error) {
              // The WebSocket spec only allows a 'simple event' to be thrown on error,
              // so we only really know as much as ECONNREFUSED.
              sock.error = 14; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
              Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'ECONNREFUSED: Connection refused']);
            };
          }
        },poll:function(sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function(sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)] = bytes;
              return 0;
            default:
              return 28;
          }
        },close:function(sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function(sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(28);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port;
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== 138) throw e;
            }
          }
        },connect:function(sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(138);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(7);
              } else {
                throw new FS.ErrnoError(30);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(26);
        },listen:function(sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(138);
          }
          if (sock.server) {
             throw new FS.ErrnoError(28);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
          Module['websocket'].emit('listen', sock.stream.fd); // Send Event with listen fd.
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
              Module['websocket'].emit('connection', newsock.stream.fd);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
              Module['websocket'].emit('connection', sock.stream.fd);
            }
          });
          sock.server.on('closed', function() {
            Module['websocket'].emit('close', sock.stream.fd);
            sock.server = null;
          });
          sock.server.on('error', function(error) {
            // Although the ws library may pass errors that may be more descriptive than
            // ECONNREFUSED they are not necessarily the expected error code e.g. 
            // ENOTFOUND on getaddrinfo seems to be node.js specific, so using EHOSTUNREACH
            // is still probably the most useful thing to do. This error shouldn't
            // occur in a well written app as errors should get trapped in the compiled
            // app's own getaddrinfo call.
            sock.error = 23; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
            Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'EHOSTUNREACH: Host is unreachable']);
            // don't throw
          });
        },accept:function(listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(28);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function(sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(53);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function(sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(17);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(53);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(6);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          if (ArrayBuffer.isView(buffer)) {
            offset += buffer.byteOffset;
            buffer = buffer.buffer;
          }
  
          var data;
          // WebSockets .send() does not allow passing a SharedArrayBuffer, so clone the portion of the SharedArrayBuffer as a regular
          // ArrayBuffer that we want to send.
          if (buffer instanceof SharedArrayBuffer) {
            data = new Uint8Array(new Uint8Array(buffer.slice(offset, offset + length))).buffer;
          } else {
            data = buffer.slice(offset, offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(28);
          }
        },recvmsg:function(sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(53);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(53);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(6);
              }
            } else {
              throw new FS.ErrnoError(6);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};
  function getSocketFromFD(fd) {
      var socket = SOCKFS.getSocket(fd);
      if (!socket) throw new FS.ErrnoError(8);
      return socket;
    }
  
  var Sockets = {BUFFER_SIZE:10240,MAX_BUFFER_SIZE:10485760,nextFd:1,fds:{},nextport:1,maxport:65535,peer:null,connections:{},portmap:{},localAddr:4261412874,addrPool:[33554442,50331658,67108874,83886090,100663306,117440522,134217738,150994954,167772170,184549386,201326602,218103818,234881034]};
  
  function inetNtop4(addr) {
      return (addr & 0xff) + '.' + ((addr >> 8) & 0xff) + '.' + ((addr >> 16) & 0xff) + '.' + ((addr >> 24) & 0xff)
    }
  
  function inetNtop6(ints) {
      //  ref:  http://www.ietf.org/rfc/rfc2373.txt - section 2.5.4
      //  Format for IPv4 compatible and mapped  128-bit IPv6 Addresses
      //  128-bits are split into eight 16-bit words
      //  stored in network byte order (big-endian)
      //  |                80 bits               | 16 |      32 bits        |
      //  +-----------------------------------------------------------------+
      //  |               10 bytes               |  2 |      4 bytes        |
      //  +--------------------------------------+--------------------------+
      //  +               5 words                |  1 |      2 words        |
      //  +--------------------------------------+--------------------------+
      //  |0000..............................0000|0000|    IPv4 ADDRESS     | (compatible)
      //  +--------------------------------------+----+---------------------+
      //  |0000..............................0000|FFFF|    IPv4 ADDRESS     | (mapped)
      //  +--------------------------------------+----+---------------------+
      var str = "";
      var word = 0;
      var longest = 0;
      var lastzero = 0;
      var zstart = 0;
      var len = 0;
      var i = 0;
      var parts = [
        ints[0] & 0xffff,
        (ints[0] >> 16),
        ints[1] & 0xffff,
        (ints[1] >> 16),
        ints[2] & 0xffff,
        (ints[2] >> 16),
        ints[3] & 0xffff,
        (ints[3] >> 16)
      ];
  
      // Handle IPv4-compatible, IPv4-mapped, loopback and any/unspecified addresses
  
      var hasipv4 = true;
      var v4part = "";
      // check if the 10 high-order bytes are all zeros (first 5 words)
      for (i = 0; i < 5; i++) {
        if (parts[i] !== 0) { hasipv4 = false; break; }
      }
  
      if (hasipv4) {
        // low-order 32-bits store an IPv4 address (bytes 13 to 16) (last 2 words)
        v4part = inetNtop4(parts[6] | (parts[7] << 16));
        // IPv4-mapped IPv6 address if 16-bit value (bytes 11 and 12) == 0xFFFF (6th word)
        if (parts[5] === -1) {
          str = "::ffff:";
          str += v4part;
          return str;
        }
        // IPv4-compatible IPv6 address if 16-bit value (bytes 11 and 12) == 0x0000 (6th word)
        if (parts[5] === 0) {
          str = "::";
          //special case IPv6 addresses
          if (v4part === "0.0.0.0") v4part = ""; // any/unspecified address
          if (v4part === "0.0.0.1") v4part = "1";// loopback address
          str += v4part;
          return str;
        }
      }
  
      // Handle all other IPv6 addresses
  
      // first run to find the longest contiguous zero words
      for (word = 0; word < 8; word++) {
        if (parts[word] === 0) {
          if (word - lastzero > 1) {
            len = 0;
          }
          lastzero = word;
          len++;
        }
        if (len > longest) {
          longest = len;
          zstart = word - longest + 1;
        }
      }
  
      for (word = 0; word < 8; word++) {
        if (longest > 1) {
          // compress contiguous zeros - to produce "::"
          if (parts[word] === 0 && word >= zstart && word < (zstart + longest) ) {
            if (word === zstart) {
              str += ":";
              if (zstart === 0) str += ":"; //leading zeros case
            }
            continue;
          }
        }
        // converts 16-bit words from big-endian to little-endian before converting to hex string
        str += Number(_ntohs(parts[word] & 0xffff)).toString(16);
        str += word < 7 ? ":" : "";
      }
      return str;
    }
  function readSockaddr(sa, salen) {
      // family / port offsets are common to both sockaddr_in and sockaddr_in6
      var family = HEAP16[((sa)>>1)];
      var port = _ntohs(HEAPU16[(((sa)+(2))>>1)]);
      var addr;
  
      switch (family) {
        case 2:
          if (salen !== 16) {
            return { errno: 28 };
          }
          addr = HEAP32[(((sa)+(4))>>2)];
          addr = inetNtop4(addr);
          break;
        case 10:
          if (salen !== 28) {
            return { errno: 28 };
          }
          addr = [
            HEAP32[(((sa)+(8))>>2)],
            HEAP32[(((sa)+(12))>>2)],
            HEAP32[(((sa)+(16))>>2)],
            HEAP32[(((sa)+(20))>>2)]
          ];
          addr = inetNtop6(addr);
          break;
        default:
          return { errno: 5 };
      }
  
      return { family: family, addr: addr, port: port };
    }
  
  function inetPton4(str) {
      var b = str.split('.');
      for (var i = 0; i < 4; i++) {
        var tmp = Number(b[i]);
        if (isNaN(tmp)) return null;
        b[i] = tmp;
      }
      return (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0;
    }
  
  /** @suppress {checkTypes} */
  function jstoi_q(str) {
      return parseInt(str);
    }
  function inetPton6(str) {
      var words;
      var w, offset, z, i;
      /* http://home.deds.nl/~aeron/regex/ */
      var valid6regx = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i
      var parts = [];
      if (!valid6regx.test(str)) {
        return null;
      }
      if (str === "::") {
        return [0, 0, 0, 0, 0, 0, 0, 0];
      }
      // Z placeholder to keep track of zeros when splitting the string on ":"
      if (str.startsWith("::")) {
        str = str.replace("::", "Z:"); // leading zeros case
      } else {
        str = str.replace("::", ":Z:");
      }
  
      if (str.indexOf(".") > 0) {
        // parse IPv4 embedded stress
        str = str.replace(new RegExp('[.]', 'g'), ":");
        words = str.split(":");
        words[words.length-4] = jstoi_q(words[words.length-4]) + jstoi_q(words[words.length-3])*256;
        words[words.length-3] = jstoi_q(words[words.length-2]) + jstoi_q(words[words.length-1])*256;
        words = words.slice(0, words.length-2);
      } else {
        words = str.split(":");
      }
  
      offset = 0; z = 0;
      for (w=0; w < words.length; w++) {
        if (typeof words[w] === 'string') {
          if (words[w] === 'Z') {
            // compressed zeros - write appropriate number of zero words
            for (z = 0; z < (8 - words.length+1); z++) {
              parts[w+z] = 0;
            }
            offset = z-1;
          } else {
            // parse hex to field to 16-bit value and write it in network byte-order
            parts[w+offset] = _htons(parseInt(words[w],16));
          }
        } else {
          // parsed IPv4 words
          parts[w+offset] = words[w];
        }
      }
      return [
        (parts[1] << 16) | parts[0],
        (parts[3] << 16) | parts[2],
        (parts[5] << 16) | parts[4],
        (parts[7] << 16) | parts[6]
      ];
    }
  var DNS = {address_map:{id:1,addrs:{},names:{}},lookup_name:function (name) {
        // If the name is already a valid ipv4 / ipv6 address, don't generate a fake one.
        var res = inetPton4(name);
        if (res !== null) {
          return name;
        }
        res = inetPton6(name);
        if (res !== null) {
          return name;
        }
  
        // See if this name is already mapped.
        var addr;
  
        if (DNS.address_map.addrs[name]) {
          addr = DNS.address_map.addrs[name];
        } else {
          var id = DNS.address_map.id++;
          assert(id < 65535, 'exceeded max address mappings of 65535');
  
          addr = '172.29.' + (id & 0xff) + '.' + (id & 0xff00);
  
          DNS.address_map.names[addr] = name;
          DNS.address_map.addrs[name] = addr;
        }
  
        return addr;
      },lookup_addr:function (addr) {
        if (DNS.address_map.names[addr]) {
          return DNS.address_map.names[addr];
        }
  
        return null;
      }};
  function getSocketAddress(addrp, addrlen, allowNull) {
      if (allowNull && addrp === 0) return null;
      var info = readSockaddr(addrp, addrlen);
      if (info.errno) throw new FS.ErrnoError(info.errno);
      info.addr = DNS.lookup_addr(info.addr) || info.addr;
      return info;
    }
  
  function ___syscall_connect(fd, addr, addrlen) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(5, 1, fd, addr, addrlen);
    try {
  
      var sock = getSocketFromFD(fd);
      var info = getSocketAddress(addr, addrlen);
      sock.sock_ops.connect(sock, info.addr, info.port);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  function ___syscall_fadvise64_64(fd, offset, len, advice) {
      return 0; // your advice is important to us (but we can't use it)
    }

  
  function ___syscall_fchmod(fd, mode) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(6, 1, fd, mode);
    try {
  
      FS.fchmod(fd, mode);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_fcntl64(fd, cmd, varargs) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(7, 1, fd, cmd, varargs);
    SYSCALLS.varargs = varargs;
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (cmd) {
        case 0: {
          var arg = SYSCALLS.get();
          if (arg < 0) {
            return -28;
          }
          var newStream;
          newStream = FS.open(stream.path, stream.flags, 0, arg);
          return newStream.fd;
        }
        case 1:
        case 2:
          return 0;  // FD_CLOEXEC makes no sense for a single process.
        case 3:
          return stream.flags;
        case 4: {
          var arg = SYSCALLS.get();
          stream.flags |= arg;
          return 0;
        }
        case 5:
        /* case 5: Currently in musl F_GETLK64 has same value as F_GETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */ {
          
          var arg = SYSCALLS.get();
          var offset = 0;
          // We're always unlocked.
          HEAP16[(((arg)+(offset))>>1)] = 2;
          return 0;
        }
        case 6:
        case 7:
        /* case 6: Currently in musl F_SETLK64 has same value as F_SETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */
        /* case 7: Currently in musl F_SETLKW64 has same value as F_SETLKW, so omitted to avoid duplicate case blocks. If that changes, uncomment this */
          
          
          return 0; // Pretend that the locking is successful.
        case 16:
        case 8:
          return -28; // These are for sockets. We don't have them fully implemented yet.
        case 9:
          // musl trusts getown return values, due to a bug where they must be, as they overlap with errors. just return -1 here, so fnctl() returns that, and we set errno ourselves.
          setErrNo(28);
          return -1;
        default: {
          return -28;
        }
      }
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_fstat64(fd, buf) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(8, 1, fd, buf);
    try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      return SYSCALLS.doStat(FS.stat, stream.path, buf);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_fstatat64(dirfd, path, buf, flags) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(9, 1, dirfd, path, buf, flags);
    try {
  
      path = SYSCALLS.getStr(path);
      var nofollow = flags & 256;
      var allowEmpty = flags & 4096;
      flags = flags & (~4352);
      path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
      return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_statfs64(path, size, buf) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(11, 1, path, size, buf);
    try {
  
      path = SYSCALLS.getStr(path);
      // NOTE: None of the constants here are true. We're just returning safe and
      //       sane values.
      HEAP32[(((buf)+(4))>>2)] = 4096;
      HEAP32[(((buf)+(40))>>2)] = 4096;
      HEAP32[(((buf)+(8))>>2)] = 1000000;
      HEAP32[(((buf)+(12))>>2)] = 500000;
      HEAP32[(((buf)+(16))>>2)] = 500000;
      HEAP32[(((buf)+(20))>>2)] = FS.nextInode;
      HEAP32[(((buf)+(24))>>2)] = 1000000;
      HEAP32[(((buf)+(28))>>2)] = 42;
      HEAP32[(((buf)+(44))>>2)] = 2;  // ST_NOSUID
      HEAP32[(((buf)+(36))>>2)] = 255;
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  
  
  function ___syscall_fstatfs64(fd, size, buf) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(10, 1, fd, size, buf);
    try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      return ___syscall_statfs64(0, size, buf);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_ftruncate64(fd, low, high) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(12, 1, fd, low, high);
    try {
  
      var length = SYSCALLS.get64(low, high);
      FS.ftruncate(fd, length);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_getcwd(buf, size) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(13, 1, buf, size);
    try {
  
      if (size === 0) return -28;
      var cwd = FS.cwd();
      var cwdLengthInBytes = lengthBytesUTF8(cwd);
      if (size < cwdLengthInBytes + 1) return -68;
      stringToUTF8(cwd, buf, size);
      return buf;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_getdents64(fd, dirp, count) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(14, 1, fd, dirp, count);
    try {
  
      var stream = SYSCALLS.getStreamFromFD(fd)
      if (!stream.getdents) {
        stream.getdents = FS.readdir(stream.path);
      }
  
      var struct_size = 280;
      var pos = 0;
      var off = FS.llseek(stream, 0, 1);
  
      var idx = Math.floor(off / struct_size);
  
      while (idx < stream.getdents.length && pos + struct_size <= count) {
        var id;
        var type;
        var name = stream.getdents[idx];
        if (name === '.') {
          id = stream.id;
          type = 4; // DT_DIR
        }
        else if (name === '..') {
          var lookup = FS.lookupPath(stream.path, { parent: true });
          id = lookup.node.id;
          type = 4; // DT_DIR
        }
        else {
          var child = FS.lookupNode(stream, name);
          id = child.id;
          type = FS.isChrdev(child.mode) ? 2 :  // DT_CHR, character device.
                 FS.isDir(child.mode) ? 4 :     // DT_DIR, directory.
                 FS.isLink(child.mode) ? 10 :   // DT_LNK, symbolic link.
                 8;                             // DT_REG, regular file.
        }
        (tempI64 = [id>>>0,(tempDouble=id,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((dirp + pos)>>2)] = tempI64[0],HEAP32[(((dirp + pos)+(4))>>2)] = tempI64[1]);
        (tempI64 = [(idx + 1) * struct_size>>>0,(tempDouble=(idx + 1) * struct_size,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((dirp + pos)+(8))>>2)] = tempI64[0],HEAP32[(((dirp + pos)+(12))>>2)] = tempI64[1]);
        HEAP16[(((dirp + pos)+(16))>>1)] = 280;
        HEAP8[(((dirp + pos)+(18))>>0)] = type;
        stringToUTF8(name, dirp + pos + 19, 256);
        pos += struct_size;
        idx += 1;
      }
      FS.llseek(stream, idx * struct_size, 0);
      return pos;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_lstat64(path, buf) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(15, 1, path, buf);
    try {
  
      path = SYSCALLS.getStr(path);
      return SYSCALLS.doStat(FS.lstat, path, buf);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_mkdir(path, mode) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(16, 1, path, mode);
    try {
  
      path = SYSCALLS.getStr(path);
      return SYSCALLS.doMkdir(path, mode);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  function syscallMmap2(addr, len, prot, flags, fd, off) {
      off <<= 12; // undo pgoffset
      var ptr;
      var allocated = false;
  
      // addr argument must be page aligned if MAP_FIXED flag is set.
      if ((flags & 16) !== 0 && (addr % 65536) !== 0) {
        return -28;
      }
  
      // MAP_ANONYMOUS (aka MAP_ANON) isn't actually defined by POSIX spec,
      // but it is widely used way to allocate memory pages on Linux, BSD and Mac.
      // In this case fd argument is ignored.
      if ((flags & 32) !== 0) {
        ptr = mmapAlloc(len);
        if (!ptr) return -48;
        allocated = true;
      } else {
        var info = FS.getStream(fd);
        if (!info) return -8;
        var res = FS.mmap(info, addr, len, off, prot, flags);
        ptr = res.ptr;
        allocated = res.allocated;
      }
      SYSCALLS.mappings[ptr] = { malloc: ptr, len: len, allocated: allocated, fd: fd, prot: prot, flags: flags, offset: off };
      return ptr;
    }
  
  function ___syscall_mmap2(addr, len, prot, flags, fd, off) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(17, 1, addr, len, prot, flags, fd, off);
    try {
  
      return syscallMmap2(addr, len, prot, flags, fd, off);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_msync(addr, len, flags) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(18, 1, addr, len, flags);
    try {
  
      var info = SYSCALLS.mappings[addr];
      if (!info) return 0;
      SYSCALLS.doMsync(addr, FS.getStream(info.fd), len, info.flags, 0);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  function syscallMunmap(addr, len) {
      // TODO: support unmmap'ing parts of allocations
      var info = SYSCALLS.mappings[addr];
      if (len === 0 || !info) {
        return -28;
      }
      if (len === info.len) {
        var stream = FS.getStream(info.fd);
        if (stream) {
          if (info.prot & 2) {
            SYSCALLS.doMsync(addr, stream, len, info.flags, info.offset);
          }
          FS.munmap(stream);
        }
        SYSCALLS.mappings[addr] = null;
        if (info.allocated) {
          _free(info.malloc);
        }
      }
      return 0;
    }
  
  function ___syscall_munmap(addr, len) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(19, 1, addr, len);
    try {
  
      return syscallMunmap(addr, len);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_open(path, flags, varargs) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(20, 1, path, flags, varargs);
    SYSCALLS.varargs = varargs;
  try {
  
      var pathname = SYSCALLS.getStr(path);
      var mode = varargs ? SYSCALLS.get() : 0;
      var stream = FS.open(pathname, flags, mode);
      return stream.fd;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_readlink(path, buf, bufsize) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(21, 1, path, buf, bufsize);
    try {
  
      path = SYSCALLS.getStr(path);
      return SYSCALLS.doReadlink(path, buf, bufsize);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_rename(old_path, new_path) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(22, 1, old_path, new_path);
    try {
  
      old_path = SYSCALLS.getStr(old_path);
      new_path = SYSCALLS.getStr(new_path);
      FS.rename(old_path, new_path);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_rmdir(path) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(23, 1, path);
    try {
  
      path = SYSCALLS.getStr(path);
      FS.rmdir(path);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_sendto(fd, message, length, flags, addr, addr_len) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(24, 1, fd, message, length, flags, addr, addr_len);
    try {
  
      var sock = getSocketFromFD(fd);
      var dest = getSocketAddress(addr, addr_len, true);
      if (!dest) {
        // send, no address provided
        return FS.write(sock.stream, HEAP8,message, length);
      } else {
        // sendto an address
        return sock.sock_ops.sendmsg(sock, HEAP8,message, length, dest.addr, dest.port);
      }
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_socket(domain, type, protocol) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(25, 1, domain, type, protocol);
    try {
  
      var sock = SOCKFS.createSocket(domain, type, protocol);
      return sock.stream.fd;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_stat64(path, buf) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(26, 1, path, buf);
    try {
  
      path = SYSCALLS.getStr(path);
      return SYSCALLS.doStat(FS.stat, path, buf);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_symlink(target, linkpath) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(27, 1, target, linkpath);
    try {
  
      target = SYSCALLS.getStr(target);
      linkpath = SYSCALLS.getStr(linkpath);
      FS.symlink(target, linkpath);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_unlink(path) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(28, 1, path);
    try {
  
      path = SYSCALLS.getStr(path);
      FS.unlink(path);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  
  function ___syscall_utimensat(dirfd, path, times, flags) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(29, 1, dirfd, path, times, flags);
    try {
  
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path, true);
      var seconds = HEAP32[((times)>>2)];
      var nanoseconds = HEAP32[(((times)+(4))>>2)];
      var atime = (seconds*1000) + (nanoseconds/(1000*1000));
      times += 8;
      seconds = HEAP32[((times)>>2)];
      nanoseconds = HEAP32[(((times)+(4))>>2)];
      var mtime = (seconds*1000) + (nanoseconds/(1000*1000));
      FS.utime(path, atime, mtime);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  
  }
  

  function __emscripten_default_pthread_stack_size() {
      return 2097152;
    }

  function __emscripten_futex_wait_non_blocking(addr, val, timeout) {
  
      // Atomics.wait is not available in the main browser thread, so simulate it via busy spinning.
      var tNow = performance.now();
      var tEnd = tNow + timeout;
  
      // Register globally which address the main thread is simulating to be
      // waiting on. When zero, the main thread is not waiting on anything, and on
      // nonzero, the contents of the address pointed by __emscripten_main_thread_futex
      // tell which address the main thread is simulating its wait on.
      // We need to be careful of recursion here: If we wait on a futex, and
      // then call _emscripten_main_thread_process_queued_calls() below, that
      // will call code that takes the proxying mutex - which can once more
      // reach this code in a nested call. To avoid interference between the
      // two (there is just a single __emscripten_main_thread_futex at a time), unmark
      // ourselves before calling the potentially-recursive call. See below for
      // how we handle the case of our futex being notified during the time in
      // between when we are not set as the value of __emscripten_main_thread_futex.
      var lastAddr = Atomics.exchange(HEAP32, __emscripten_main_thread_futex >> 2, addr);
  
      while (1) {
        // Check for a timeout.
        tNow = performance.now();
        if (tNow > tEnd) {
          // We timed out, so stop marking ourselves as waiting.
          lastAddr = Atomics.exchange(HEAP32, __emscripten_main_thread_futex >> 2, 0);
          return -73;
        }
        // We are performing a blocking loop here, so we must handle proxied
        // events from pthreads, to avoid deadlocks.
        // Note that we have to do so carefully, as we may take a lock while
        // doing so, which can recurse into this function; stop marking
        // ourselves as waiting while we do so.
        lastAddr = Atomics.exchange(HEAP32, __emscripten_main_thread_futex >> 2, 0);
        if (lastAddr == 0) {
          // We were told to stop waiting, so stop.
          break;
        }
        _emscripten_main_thread_process_queued_calls();
  
        // Check the value, as if we were starting the futex all over again.
        // This handles the following case:
        //
        //  * wait on futex A
        //  * recurse into emscripten_main_thread_process_queued_calls(),
        //    which waits on futex B. that sets the __emscripten_main_thread_futex address to
        //    futex B, and there is no longer any mention of futex A.
        //  * a worker is done with futex A. it checks __emscripten_main_thread_futex but does
        //    not see A, so it does nothing special for the main thread.
        //  * a worker is done with futex B. it flips mainThreadMutex from B
        //    to 0, ending the wait on futex B.
        //  * we return to the wait on futex A. __emscripten_main_thread_futex is 0, but that
        //    is because of futex B being done - we can't tell from
        //    __emscripten_main_thread_futex whether A is done or not. therefore, check the
        //    memory value of the futex.
        //
        // That case motivates the design here. Given that, checking the memory
        // address is also necessary for other reasons: we unset and re-set our
        // address in __emscripten_main_thread_futex around calls to
        // emscripten_main_thread_process_queued_calls(), and a worker could
        // attempt to wake us up right before/after such times.
        //
        // Note that checking the memory value of the futex is valid to do: we
        // could easily have been delayed (relative to the worker holding on
        // to futex A), which means we could be starting all of our work at the
        // later time when there is no need to block. The only "odd" thing is
        // that we may have caused side effects in that "delay" time. But the
        // only side effects we can have are to call
        // emscripten_main_thread_process_queued_calls(). That is always ok to
        // do on the main thread (it's why it is ok for us to call it in the
        // middle of this function, and elsewhere). So if we check the value
        // here and return, it's the same is if what happened on the main thread
        // was the same as calling emscripten_main_thread_process_queued_calls()
        // a few times times before calling emscripten_futex_wait().
        if (Atomics.load(HEAP32, addr >> 2) != val) {
          return -6;
        }
  
        // Mark us as waiting once more, and continue the loop.
        lastAddr = Atomics.exchange(HEAP32, __emscripten_main_thread_futex >> 2, addr);
      }
      return 0;
    }

  function __emscripten_notify_thread_queue(targetThreadId, mainThreadId) {
      if (targetThreadId == mainThreadId) {
        postMessage({'cmd' : 'processQueuedMainThreadWork'});
      } else if (ENVIRONMENT_IS_PTHREAD) {
        postMessage({'targetThread': targetThreadId, 'cmd': 'processThreadQueue'});
      } else {
        var pthread = PThread.pthreads[targetThreadId];
        var worker = pthread && pthread.worker;
        if (!worker) {
          return /*0*/;
        }
        worker.postMessage({'cmd' : 'processThreadQueue'});
      }
      return 1;
    }

  function __gmtime_js(time, tmPtr) {
      var date = new Date(HEAP32[((time)>>2)]*1000);
      HEAP32[((tmPtr)>>2)] = date.getUTCSeconds();
      HEAP32[(((tmPtr)+(4))>>2)] = date.getUTCMinutes();
      HEAP32[(((tmPtr)+(8))>>2)] = date.getUTCHours();
      HEAP32[(((tmPtr)+(12))>>2)] = date.getUTCDate();
      HEAP32[(((tmPtr)+(16))>>2)] = date.getUTCMonth();
      HEAP32[(((tmPtr)+(20))>>2)] = date.getUTCFullYear()-1900;
      HEAP32[(((tmPtr)+(24))>>2)] = date.getUTCDay();
      var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
      var yday = ((date.getTime() - start) / (1000 * 60 * 60 * 24))|0;
      HEAP32[(((tmPtr)+(28))>>2)] = yday;
    }

  function _abort() {
      abort('');
    }


  var DOTNETENTROPY = {batchedQuotaMax:65536,getBatchedRandomValues:function (buffer, bufferLength) {
              // for modern web browsers
              // map the work array to the memory buffer passed with the length
              for (let i = 0; i < bufferLength; i += this.batchedQuotaMax) {
                  //const view = new Uint8Array(Module.HEAPU8.buffer, buffer + i, Math.min(bufferLength - i, this.batchedQuotaMax));
                  //crypto.getRandomValues(view)
                  const array = new Uint8Array(Math.min(bufferLength - i, this.batchedQuotaMax));
                  crypto.getRandomValues(array)
                  new Uint8Array(Module.HEAPU8.buffer, buffer + i, array.length).set(array);
              }
          }};
  function _dotnet_browser_entropy(buffer, bufferLength) {
          // check that we have crypto available
          if (typeof crypto === 'object' && typeof crypto['getRandomValues'] === 'function') {
              DOTNETENTROPY.getBatchedRandomValues(buffer, bufferLength)
              return 0;
          } else {
              // we couldn't find a proper implementation, as Math.random() is not suitable
              // instead of aborting here we will return and let managed code handle the message
              return -1;
          }
      }

  function maybeExit() {
      if (!keepRuntimeAlive()) {
        try {
          if (ENVIRONMENT_IS_PTHREAD) __emscripten_thread_exit(EXITSTATUS);
          else
          _exit(EXITSTATUS);
        } catch (e) {
          handleException(e);
        }
      }
    }
  function callUserCallback(func, synchronous) {
      if (runtimeExited || ABORT) {
        return;
      }
      // For synchronous calls, let any exceptions propagate, and don't let the runtime exit.
      if (synchronous) {
        func();
        return;
      }
      try {
        func();
        if (ENVIRONMENT_IS_PTHREAD)
          maybeExit();
      } catch (e) {
        handleException(e);
      }
    }
  
  function runtimeKeepalivePush() {
      runtimeKeepaliveCounter += 1;
    }
  
  function runtimeKeepalivePop() {
      runtimeKeepaliveCounter -= 1;
    }
  function safeSetTimeout(func, timeout) {
      runtimeKeepalivePush();
      return setTimeout(function() {
        runtimeKeepalivePop();
        callUserCallback(func);
      }, timeout);
    }
  
  function _emscripten_set_main_loop_timing(mode, value) {
      Browser.mainLoop.timingMode = mode;
      Browser.mainLoop.timingValue = value;
  
      if (!Browser.mainLoop.func) {
        return 1; // Return non-zero on failure, can't set timing mode when there is no main loop.
      }
  
      if (!Browser.mainLoop.running) {
        runtimeKeepalivePush();
        Browser.mainLoop.running = true;
      }
      if (mode == 0 /*EM_TIMING_SETTIMEOUT*/) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
          var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now())|0;
          setTimeout(Browser.mainLoop.runner, timeUntilNextTick); // doing this each time means that on exception, we stop
        };
        Browser.mainLoop.method = 'timeout';
      } else if (mode == 1 /*EM_TIMING_RAF*/) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
          Browser.requestAnimationFrame(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = 'rAF';
      } else if (mode == 2 /*EM_TIMING_SETIMMEDIATE*/) {
        if (typeof setImmediate === 'undefined') {
          // Emulate setImmediate. (note: not a complete polyfill, we don't emulate clearImmediate() to keep code size to minimum, since not needed)
          var setImmediates = [];
          var emscriptenMainLoopMessageId = 'setimmediate';
          var Browser_setImmediate_messageHandler = function(event) {
            // When called in current thread or Worker, the main loop ID is structured slightly different to accommodate for --proxy-to-worker runtime listening to Worker events,
            // so check for both cases.
            if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
              event.stopPropagation();
              setImmediates.shift()();
            }
          }
          addEventListener("message", Browser_setImmediate_messageHandler, true);
          setImmediate = /** @type{function(function(): ?, ...?): number} */(function Browser_emulated_setImmediate(func) {
            setImmediates.push(func);
            if (ENVIRONMENT_IS_WORKER) {
              if (Module['setImmediates'] === undefined) Module['setImmediates'] = [];
              Module['setImmediates'].push(func);
              postMessage({target: emscriptenMainLoopMessageId}); // In --proxy-to-worker, route the message via proxyClient.js
            } else postMessage(emscriptenMainLoopMessageId, "*"); // On the main thread, can just send the message to itself.
          })
        }
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
          setImmediate(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = 'immediate';
      }
      return 0;
    }
  function setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop, arg, noSetTiming) {
      assert(!Browser.mainLoop.func, 'emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.');
  
      Browser.mainLoop.func = browserIterationFunc;
      Browser.mainLoop.arg = arg;
  
      var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
      function checkIsRunning() {
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) {
          runtimeKeepalivePop();
          maybeExit();
          return false;
        }
        return true;
      }
  
      // We create the loop runner here but it is not actually running until
      // _emscripten_set_main_loop_timing is called (which might happen a
      // later time).  This member signifies that the current runner has not
      // yet been started so that we can call runtimeKeepalivePush when it
      // gets it timing set for the first time.
      Browser.mainLoop.running = false;
      Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT) return;
        if (Browser.mainLoop.queue.length > 0) {
          var start = Date.now();
          var blocker = Browser.mainLoop.queue.shift();
          blocker.func(blocker.arg);
          if (Browser.mainLoop.remainingBlockers) {
            var remaining = Browser.mainLoop.remainingBlockers;
            var next = remaining%1 == 0 ? remaining-1 : Math.floor(remaining);
            if (blocker.counted) {
              Browser.mainLoop.remainingBlockers = next;
            } else {
              // not counted, but move the progress along a tiny bit
              next = next + 0.5; // do not steal all the next one's progress
              Browser.mainLoop.remainingBlockers = (8*remaining + next)/9;
            }
          }
          out('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + ' ms'); //, left: ' + Browser.mainLoop.remainingBlockers);
          Browser.mainLoop.updateStatus();
  
          // catches pause/resume main loop from blocker execution
          if (!checkIsRunning()) return;
  
          setTimeout(Browser.mainLoop.runner, 0);
          return;
        }
  
        // catch pauses from non-main loop sources
        if (!checkIsRunning()) return;
  
        // Implement very basic swap interval control
        Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
        if (Browser.mainLoop.timingMode == 1/*EM_TIMING_RAF*/ && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
          // Not the scheduled time to render this frame - skip.
          Browser.mainLoop.scheduler();
          return;
        } else if (Browser.mainLoop.timingMode == 0/*EM_TIMING_SETTIMEOUT*/) {
          Browser.mainLoop.tickStartTime = _emscripten_get_now();
        }
  
        // Signal GL rendering layer that processing of a new frame is about to start. This helps it optimize
        // VBO double-buffering and reduce GPU stalls.
  
        Browser.mainLoop.runIter(browserIterationFunc);
  
        // catch pauses from the main loop itself
        if (!checkIsRunning()) return;
  
        // Queue new audio data. This is important to be right after the main loop invocation, so that we will immediately be able
        // to queue the newest produced audio samples.
        // TODO: Consider adding pre- and post- rAF callbacks so that GL.newRenderingFrameStarted() and SDL.audio.queueNewAudioData()
        //       do not need to be hardcoded into this function, but can be more generic.
        if (typeof SDL === 'object' && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
  
        Browser.mainLoop.scheduler();
      }
  
      if (!noSetTiming) {
        if (fps && fps > 0) _emscripten_set_main_loop_timing(0/*EM_TIMING_SETTIMEOUT*/, 1000.0 / fps);
        else _emscripten_set_main_loop_timing(1/*EM_TIMING_RAF*/, 1); // Do rAF by rendering each frame (no decimating)
  
        Browser.mainLoop.scheduler();
      }
  
      if (simulateInfiniteLoop) {
        throw 'unwind';
      }
    }
  var Browser = {mainLoop:{running:false,scheduler:null,method:"",currentlyRunningMainloop:0,func:null,arg:0,timingMode:0,timingValue:0,currentFrameNumber:0,queue:[],pause:function() {
          Browser.mainLoop.scheduler = null;
          // Incrementing this signals the previous main loop that it's now become old, and it must return.
          Browser.mainLoop.currentlyRunningMainloop++;
        },resume:function() {
          Browser.mainLoop.currentlyRunningMainloop++;
          var timingMode = Browser.mainLoop.timingMode;
          var timingValue = Browser.mainLoop.timingValue;
          var func = Browser.mainLoop.func;
          Browser.mainLoop.func = null;
          // do not set timing and call scheduler, we will do it on the next lines
          setMainLoop(func, 0, false, Browser.mainLoop.arg, true);
          _emscripten_set_main_loop_timing(timingMode, timingValue);
          Browser.mainLoop.scheduler();
        },updateStatus:function() {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        },runIter:function(func) {
          if (ABORT) return;
          if (Module['preMainLoop']) {
            var preRet = Module['preMainLoop']();
            if (preRet === false) {
              return; // |return false| skips a frame
            }
          }
          callUserCallback(func);
          if (Module['postMainLoop']) Module['postMainLoop']();
        }},isFullscreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function() {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          out("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? out("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          out("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = () => {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = (event) => {
            out('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              out('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === Module['canvas'] ||
                                document['mozPointerLockElement'] === Module['canvas'] ||
                                document['webkitPointerLockElement'] === Module['canvas'] ||
                                document['msPointerLockElement'] === Module['canvas'];
        }
        var canvas = Module['canvas'];
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
  
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      function(){};
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   function(){}; // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", function(ev) {
              if (!Browser.pointerLock && Module['canvas'].requestPointerLock) {
                Module['canvas'].requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },createContext:function(canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx; // no need to recreate GL context if it's already been created for this canvas.
  
        var ctx;
        var contextHandle;
        if (useWebGL) {
          // For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
          var contextAttributes = {
            antialias: false,
            alpha: false,
            majorVersion: 1,
          };
  
          if (webGLContextAttributes) {
            for (var attribute in webGLContextAttributes) {
              contextAttributes[attribute] = webGLContextAttributes[attribute];
            }
          }
  
          // This check of existence of GL is here to satisfy Closure compiler, which yells if variable GL is referenced below but GL object is not
          // actually compiled in because application is not doing any GL operations. TODO: Ideally if GL is not being used, this function
          // Browser.createContext() should not even be emitted.
          if (typeof GL !== 'undefined') {
            contextHandle = GL.createContext(canvas, contextAttributes);
            if (contextHandle) {
              ctx = GL.getContext(contextHandle).GLctx;
            }
          }
        } else {
          ctx = canvas.getContext('2d');
        }
  
        if (!ctx) return null;
  
        if (setInModule) {
          if (!useWebGL) assert(typeof GLctx === 'undefined', 'cannot set in module if GLctx is used, but we are a non-GL context that would replace it');
  
          Module.ctx = ctx;
          if (useWebGL) GL.makeContextCurrent(contextHandle);
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function(canvas, useWebGL, setInModule) {},fullscreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullscreen:function(lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullscreenChange() {
          Browser.isFullscreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['fullscreenElement'] || document['mozFullScreenElement'] ||
               document['msFullscreenElement'] || document['webkitFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.exitFullscreen = Browser.exitFullscreen;
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullscreen = true;
            if (Browser.resizeCanvas) {
              Browser.setFullscreenCanvasSize();
            } else {
              Browser.updateCanvasDimensions(canvas);
            }
          } else {
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
  
            if (Browser.resizeCanvas) {
              Browser.setWindowedCanvasSize();
            } else {
              Browser.updateCanvasDimensions(canvas);
            }
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullscreen);
          if (Module['onFullscreen']) Module['onFullscreen'](Browser.isFullscreen);
        }
  
        if (!Browser.fullscreenHandlersInstalled) {
          Browser.fullscreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullscreenChange, false);
          document.addEventListener('mozfullscreenchange', fullscreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullscreenChange, false);
          document.addEventListener('MSFullscreenChange', fullscreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
  
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullscreen = canvasContainer['requestFullscreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullscreen'] ? function() { canvasContainer['webkitRequestFullscreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null) ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
  
        canvasContainer.requestFullscreen();
      },exitFullscreen:function() {
        // This is workaround for chrome. Trying to exit from fullscreen
        // not in fullscreen state will cause "TypeError: Document not active"
        // in chrome. See https://github.com/emscripten-core/emscripten/pull/8236
        if (!Browser.isFullscreen) {
          return false;
        }
  
        var CFS = document['exitFullscreen'] ||
                  document['cancelFullScreen'] ||
                  document['mozCancelFullScreen'] ||
                  document['msExitFullscreen'] ||
                  document['webkitCancelFullScreen'] ||
            (function() {});
        CFS.apply(document, []);
        return true;
      },nextRAF:0,fakeRequestAnimationFrame:function(func) {
        // try to keep 60fps between calls to here
        var now = Date.now();
        if (Browser.nextRAF === 0) {
          Browser.nextRAF = now + 1000/60;
        } else {
          while (now + 2 >= Browser.nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
            Browser.nextRAF += 1000/60;
          }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
      },requestAnimationFrame:function(func) {
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(func);
          return;
        }
        var RAF = Browser.fakeRequestAnimationFrame;
        RAF(func);
      },safeSetTimeout:function(func) {
        // Legacy function, this is used by the SDL2 port so we need to keep it
        // around at least until that is updated.
        return safeSetTimeout(func);
      },safeRequestAnimationFrame:function(func) {
        runtimeKeepalivePush();
        return Browser.requestAnimationFrame(function() {
          runtimeKeepalivePop();
          callUserCallback(func);
        });
      },getMimetype:function(name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function(func) {
        if (!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function(event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function(event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function(event) {
        var delta = 0;
        switch (event.type) {
          case 'DOMMouseScroll':
            // 3 lines make up a step
            delta = event.detail / 3;
            break;
          case 'mousewheel':
            // 120 units make up a step
            delta = event.wheelDelta / 120;
            break;
          case 'wheel':
            delta = event.deltaY
            switch (event.deltaMode) {
              case 0:
                // DOM_DELTA_PIXEL: 100 pixels make up a step
                delta /= 100;
                break;
              case 1:
                // DOM_DELTA_LINE: 3 lines make up a step
                delta /= 3;
                break;
              case 2:
                // DOM_DELTA_PAGE: A page makes up 80 steps
                delta *= 80;
                break;
              default:
                throw 'unrecognized mouse wheel delta mode: ' + event.deltaMode;
            }
            break;
          default:
            throw 'unrecognized mouse wheel event: ' + event.type;
        }
        return delta;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function(event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
  
          // check if SDL is available
          if (typeof SDL != "undefined") {
            Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
            Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
            // just add the mouse delta to the current absolut mouse position
            // FIXME: ideally this should be clamped against the canvas size and zero
            Browser.mouseX += Browser.mouseMovementX;
            Browser.mouseY += Browser.mouseMovementY;
          }
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
  
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              var last = Browser.touches[touch.identifier];
              if (!last) last = coords;
              Browser.lastTouches[touch.identifier] = last;
              Browser.touches[touch.identifier] = coords;
            }
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },resizeListeners:[],updateResizeListeners:function() {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function(width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullscreenCanvasSize:function() {
        // check if SDL is available
        if (typeof SDL != "undefined") {
          var flags = HEAPU32[((SDL.screen)>>2)];
          flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
          HEAP32[((SDL.screen)>>2)] = flags;
        }
        Browser.updateCanvasDimensions(Module['canvas']);
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function() {
        // check if SDL is available
        if (typeof SDL != "undefined") {
          var flags = HEAPU32[((SDL.screen)>>2)];
          flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
          HEAP32[((SDL.screen)>>2)] = flags;
        }
        Browser.updateCanvasDimensions(Module['canvas']);
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function(canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['fullscreenElement'] || document['mozFullScreenElement'] ||
             document['msFullscreenElement'] || document['webkitFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};
  function _emscripten_async_call(func, arg, millis) {
      function wrapper() {
        getWasmTableEntry(func)(arg);
      }
  
      if (millis >= 0
        // node does not support requestAnimationFrame
        || ENVIRONMENT_IS_NODE
      ) {
        safeSetTimeout(wrapper, millis);
      } else {
        Browser.safeRequestAnimationFrame(wrapper);
      }
    }

  function _emscripten_check_blocking_allowed() {
      if (ENVIRONMENT_IS_NODE) return;
  
      if (ENVIRONMENT_IS_WORKER) return; // Blocking in a worker/pthread is fine.
  
      warnOnce('Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread');
  
    }

  function _emscripten_get_heap_max() {
      return HEAPU8.length;
    }


  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }

  function _emscripten_num_logical_cores() {
      if (ENVIRONMENT_IS_NODE) return require('os').cpus().length;
      return navigator['hardwareConcurrency'];
    }

  /** @type{function(number, (number|boolean), ...(number|boolean))} */
  function _emscripten_proxy_to_main_thread_js(index, sync) {
      // Additional arguments are passed after those two, which are the actual
      // function arguments.
      // The serialization buffer contains the number of call params, and then
      // all the args here.
      // We also pass 'sync' to C separately, since C needs to look at it.
      var numCallArgs = arguments.length - 2;
      var outerArgs = arguments;
      // Allocate a buffer, which will be copied by the C code.
      return withStackSave(function() {
        // First passed parameter specifies the number of arguments to the function.
        // When BigInt support is enabled, we must handle types in a more complex
        // way, detecting at runtime if a value is a BigInt or not (as we have no
        // type info here). To do that, add a "prefix" before each value that
        // indicates if it is a BigInt, which effectively doubles the number of
        // values we serialize for proxying. TODO: pack this?
        var serializedNumCallArgs = numCallArgs ;
        var args = stackAlloc(serializedNumCallArgs * 8);
        var b = args >> 3;
        for (var i = 0; i < numCallArgs; i++) {
          var arg = outerArgs[2 + i];
          HEAPF64[b + i] = arg;
        }
        return _emscripten_run_in_main_runtime_thread_js(index, serializedNumCallArgs, args, sync);
      });
    }
  
  var _emscripten_receive_on_main_thread_js_callArgs = [];
  function _emscripten_receive_on_main_thread_js(index, numCallArgs, args) {
      _emscripten_receive_on_main_thread_js_callArgs.length = numCallArgs;
      var b = args >> 3;
      for (var i = 0; i < numCallArgs; i++) {
        _emscripten_receive_on_main_thread_js_callArgs[i] = HEAPF64[b + i];
      }
      // Proxied JS library funcs are encoded as positive values, and
      // EM_ASMs as negative values (see include_asm_consts)
      var isEmAsmConst = index < 0;
      var func = !isEmAsmConst ? proxiedFunctionTable[index] : ASM_CONSTS[-index - 1];
      return func.apply(null, _emscripten_receive_on_main_thread_js_callArgs);
    }

  function abortOnCannotGrowMemory(requestedSize) {
      abort('OOM');
    }
  function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      abortOnCannotGrowMemory(requestedSize);
    }

  var JSEvents = {inEventHandler:0,removeAllEventListeners:function() {
        for (var i = JSEvents.eventHandlers.length-1; i >= 0; --i) {
          JSEvents._removeHandler(i);
        }
        JSEvents.eventHandlers = [];
        JSEvents.deferredCalls = [];
      },registerRemoveEventListeners:function() {
        if (!JSEvents.removeEventListenersRegistered) {
          __ATEXIT__.push(JSEvents.removeAllEventListeners);
          JSEvents.removeEventListenersRegistered = true;
        }
      },deferredCalls:[],deferCall:function(targetFunction, precedence, argsList) {
        function arraysHaveEqualContent(arrA, arrB) {
          if (arrA.length != arrB.length) return false;
  
          for (var i in arrA) {
            if (arrA[i] != arrB[i]) return false;
          }
          return true;
        }
        // Test if the given call was already queued, and if so, don't add it again.
        for (var i in JSEvents.deferredCalls) {
          var call = JSEvents.deferredCalls[i];
          if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
            return;
          }
        }
        JSEvents.deferredCalls.push({
          targetFunction: targetFunction,
          precedence: precedence,
          argsList: argsList
        });
  
        JSEvents.deferredCalls.sort(function(x,y) { return x.precedence < y.precedence; });
      },removeDeferredCalls:function(targetFunction) {
        for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
          if (JSEvents.deferredCalls[i].targetFunction == targetFunction) {
            JSEvents.deferredCalls.splice(i, 1);
            --i;
          }
        }
      },canPerformEventHandlerRequests:function() {
        return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls;
      },runDeferredCalls:function() {
        if (!JSEvents.canPerformEventHandlerRequests()) {
          return;
        }
        for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
          var call = JSEvents.deferredCalls[i];
          JSEvents.deferredCalls.splice(i, 1);
          --i;
          call.targetFunction.apply(null, call.argsList);
        }
      },eventHandlers:[],removeAllHandlersOnTarget:function(target, eventTypeString) {
        for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
          if (JSEvents.eventHandlers[i].target == target && 
            (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
             JSEvents._removeHandler(i--);
           }
        }
      },_removeHandler:function(i) {
        var h = JSEvents.eventHandlers[i];
        h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
        JSEvents.eventHandlers.splice(i, 1);
      },registerOrRemoveHandler:function(eventHandler) {
        var jsEventHandler = function jsEventHandler(event) {
          // Increment nesting count for the event handler.
          ++JSEvents.inEventHandler;
          JSEvents.currentEventHandler = eventHandler;
          // Process any old deferred calls the user has placed.
          JSEvents.runDeferredCalls();
          // Process the actual event, calls back to user C code handler.
          eventHandler.handlerFunc(event);
          // Process any new deferred calls that were placed right now from this event handler.
          JSEvents.runDeferredCalls();
          // Out of event handler - restore nesting count.
          --JSEvents.inEventHandler;
        };
        
        if (eventHandler.callbackfunc) {
          eventHandler.eventListenerFunc = jsEventHandler;
          eventHandler.target.addEventListener(eventHandler.eventTypeString, jsEventHandler, eventHandler.useCapture);
          JSEvents.eventHandlers.push(eventHandler);
          JSEvents.registerRemoveEventListeners();
        } else {
          for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
            if (JSEvents.eventHandlers[i].target == eventHandler.target
             && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
               JSEvents._removeHandler(i--);
             }
          }
        }
      },queueEventHandlerOnThread_iiii:function(targetThread, eventHandlerFunc, eventTypeId, eventData, userData) {
        withStackSave(function() {
          var varargs = stackAlloc(12);
          HEAP32[((varargs)>>2)] = eventTypeId;
          HEAP32[(((varargs)+(4))>>2)] = eventData;
          HEAP32[(((varargs)+(8))>>2)] = userData;
          _emscripten_dispatch_to_thread_(targetThread, 637534208, eventHandlerFunc, eventData, varargs);
        });
      },getTargetThreadForEventCallback:function(targetThread) {
        switch (targetThread) {
          case 1: return 0; // The event callback for the current event should be called on the main browser thread. (0 == don't proxy)
          case 2: return PThread.currentProxiedOperationCallerThread; // The event callback for the current event should be backproxied to the thread that is registering the event.
          default: return targetThread; // The event callback for the current event should be proxied to the given specific thread.
        }
      },getNodeNameForTarget:function(target) {
        if (!target) return '';
        if (target == window) return '#window';
        if (target == screen) return '#screen';
        return (target && target.nodeName) ? target.nodeName : '';
      },fullscreenEnabled:function() {
        return document.fullscreenEnabled
        // Safari 13.0.3 on macOS Catalina 10.15.1 still ships with prefixed webkitFullscreenEnabled.
        // TODO: If Safari at some point ships with unprefixed version, update the version check above.
        || document.webkitFullscreenEnabled
         ;
      }};
  
  function stringToNewUTF8(jsString) {
      var length = lengthBytesUTF8(jsString)+1;
      var cString = _malloc(length);
      stringToUTF8(jsString, cString, length);
      return cString;
    }
  function _emscripten_set_offscreencanvas_size_on_target_thread_js(targetThread, targetCanvas, width, height) {
      withStackSave(function() {
        var varargs = stackAlloc(12);
        var targetCanvasPtr = 0;
        if (targetCanvas) {
          targetCanvasPtr = stringToNewUTF8(targetCanvas);
        }
        HEAP32[((varargs)>>2)] = targetCanvasPtr;
        HEAP32[(((varargs)+(4))>>2)] = width;
        HEAP32[(((varargs)+(8))>>2)] = height;
        // Note: If we are also a pthread, the call below could theoretically be done synchronously. However if the target pthread is waiting for a mutex from us, then
        // these two threads will deadlock. At the moment, we'd like to consider that this kind of deadlock would be an Emscripten runtime bug, although if
        // emscripten_set_canvas_element_size() was documented to require running an event in the queue of thread that owns the OffscreenCanvas, then that might be ok.
        // (safer this way however)
        _emscripten_dispatch_to_thread_(targetThread, 657457152, 0, targetCanvasPtr /* satellite data */, varargs);
      });
    }
  function _emscripten_set_offscreencanvas_size_on_target_thread(targetThread, targetCanvas, width, height) {
      targetCanvas = targetCanvas ? UTF8ToString(targetCanvas) : '';
      _emscripten_set_offscreencanvas_size_on_target_thread_js(targetThread, targetCanvas, width, height);
    }
  
  function maybeCStringToJsString(cString) {
      // "cString > 2" checks if the input is a number, and isn't of the special
      // values we accept here, EMSCRIPTEN_EVENT_TARGET_* (which map to 0, 1, 2).
      // In other words, if cString > 2 then it's a pointer to a valid place in
      // memory, and points to a C string.
      return cString > 2 ? UTF8ToString(cString) : cString;
    }
  
  var specialHTMLTargets = [0, typeof document !== 'undefined' ? document : 0, typeof window !== 'undefined' ? window : 0];
  function findEventTarget(target) {
      target = maybeCStringToJsString(target);
      var domElement = specialHTMLTargets[target] || (typeof document !== 'undefined' ? document.querySelector(target) : undefined);
      return domElement;
    }
  function findCanvasEventTarget(target) { return findEventTarget(target); }
  function _emscripten_set_canvas_element_size_calling_thread(target, width, height) {
      var canvas = findCanvasEventTarget(target);
      if (!canvas) return -4;
  
      if (canvas.canvasSharedPtr) {
        // N.B. We hold the canvasSharedPtr info structure as the authoritative source for specifying the size of a canvas
        // since the actual canvas size changes are asynchronous if the canvas is owned by an OffscreenCanvas on another thread.
        // Therefore when setting the size, eagerly set the size of the canvas on the calling thread here, though this thread
        // might not be the one that actually ends up specifying the size, but the actual size change may be dispatched
        // as an asynchronous event below.
        HEAP32[((canvas.canvasSharedPtr)>>2)] = width;
        HEAP32[(((canvas.canvasSharedPtr)+(4))>>2)] = height;
      }
  
      if (canvas.offscreenCanvas || !canvas.controlTransferredOffscreen) {
        if (canvas.offscreenCanvas) canvas = canvas.offscreenCanvas;
        var autoResizeViewport = false;
        if (canvas.GLctxObject && canvas.GLctxObject.GLctx) {
          var prevViewport = canvas.GLctxObject.GLctx.getParameter(0xBA2 /* GL_VIEWPORT */);
          // TODO: Perhaps autoResizeViewport should only be true if FBO 0 is currently active?
          autoResizeViewport = (prevViewport[0] === 0 && prevViewport[1] === 0 && prevViewport[2] === canvas.width && prevViewport[3] === canvas.height);
        }
        canvas.width = width;
        canvas.height = height;
        if (autoResizeViewport) {
          // TODO: Add -s CANVAS_RESIZE_SETS_GL_VIEWPORT=0/1 option (default=1). This is commonly done and several graphics engines depend on this,
          // but this can be quite disruptive.
          canvas.GLctxObject.GLctx.viewport(0, 0, width, height);
        }
      } else if (canvas.canvasSharedPtr) {
        var targetThread = HEAP32[(((canvas.canvasSharedPtr)+(8))>>2)];
        _emscripten_set_offscreencanvas_size_on_target_thread(targetThread, target, width, height);
        return 1; // This will have to be done asynchronously
      } else {
        return -4;
      }
      return 0;
    }
  
  
  function _emscripten_set_canvas_element_size_main_thread(target, width, height) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(30, 1, target, width, height);
     return _emscripten_set_canvas_element_size_calling_thread(target, width, height); 
  }
  
  function _emscripten_set_canvas_element_size(target, width, height) {
      var canvas = findCanvasEventTarget(target);
      if (canvas) {
        return _emscripten_set_canvas_element_size_calling_thread(target, width, height);
      } else {
        return _emscripten_set_canvas_element_size_main_thread(target, width, height);
      }
    }

  function _emscripten_unwind_to_js_event_loop() {
      throw 'unwind';
    }

  function __webgl_enable_ANGLE_instanced_arrays(ctx) {
      // Extension available in WebGL 1 from Firefox 26 and Google Chrome 30 onwards. Core feature in WebGL 2.
      var ext = ctx.getExtension('ANGLE_instanced_arrays');
      if (ext) {
        ctx['vertexAttribDivisor'] = function(index, divisor) { ext['vertexAttribDivisorANGLE'](index, divisor); };
        ctx['drawArraysInstanced'] = function(mode, first, count, primcount) { ext['drawArraysInstancedANGLE'](mode, first, count, primcount); };
        ctx['drawElementsInstanced'] = function(mode, count, type, indices, primcount) { ext['drawElementsInstancedANGLE'](mode, count, type, indices, primcount); };
        return 1;
      }
    }
  
  function __webgl_enable_OES_vertex_array_object(ctx) {
      // Extension available in WebGL 1 from Firefox 25 and WebKit 536.28/desktop Safari 6.0.3 onwards. Core feature in WebGL 2.
      var ext = ctx.getExtension('OES_vertex_array_object');
      if (ext) {
        ctx['createVertexArray'] = function() { return ext['createVertexArrayOES'](); };
        ctx['deleteVertexArray'] = function(vao) { ext['deleteVertexArrayOES'](vao); };
        ctx['bindVertexArray'] = function(vao) { ext['bindVertexArrayOES'](vao); };
        ctx['isVertexArray'] = function(vao) { return ext['isVertexArrayOES'](vao); };
        return 1;
      }
    }
  
  function __webgl_enable_WEBGL_draw_buffers(ctx) {
      // Extension available in WebGL 1 from Firefox 28 onwards. Core feature in WebGL 2.
      var ext = ctx.getExtension('WEBGL_draw_buffers');
      if (ext) {
        ctx['drawBuffers'] = function(n, bufs) { ext['drawBuffersWEBGL'](n, bufs); };
        return 1;
      }
    }
  
  function __webgl_enable_WEBGL_multi_draw(ctx) {
      // Closure is expected to be allowed to minify the '.multiDrawWebgl' property, so not accessing it quoted.
      return !!(ctx.multiDrawWebgl = ctx.getExtension('WEBGL_multi_draw'));
    }
  var GL = {counter:1,buffers:[],programs:[],framebuffers:[],renderbuffers:[],textures:[],shaders:[],vaos:[],contexts:{},offscreenCanvases:{},queries:[],stringCache:{},unpackAlignment:4,recordError:function recordError(errorCode) {
        if (!GL.lastError) {
          GL.lastError = errorCode;
        }
      },getNewId:function(table) {
        var ret = GL.counter++;
        for (var i = table.length; i < ret; i++) {
          table[i] = null;
        }
        return ret;
      },getSource:function(shader, count, string, length) {
        var source = '';
        for (var i = 0; i < count; ++i) {
          var len = length ? HEAP32[(((length)+(i*4))>>2)] : -1;
          source += UTF8ToString(HEAP32[(((string)+(i*4))>>2)], len < 0 ? undefined : len);
        }
        return source;
      },createContext:function(canvas, webGLContextAttributes) {
  
        // BUG: Workaround Safari WebGL issue: After successfully acquiring WebGL context on a canvas,
        // calling .getContext() will always return that context independent of which 'webgl' or 'webgl2'
        // context version was passed. See https://bugs.webkit.org/show_bug.cgi?id=222758 and
        // https://github.com/emscripten-core/emscripten/issues/13295.
        // TODO: Once the bug is fixed and shipped in Safari, adjust the Safari version field in above check.
        if (!canvas.getContextSafariWebGL2Fixed) {
          canvas.getContextSafariWebGL2Fixed = canvas.getContext;
          canvas.getContext = function(ver, attrs) {
            var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
            return ((ver == 'webgl') == (gl instanceof WebGLRenderingContext)) ? gl : null;
          }
        }
  
        var ctx = 
          (canvas.getContext("webgl", webGLContextAttributes)
            // https://caniuse.com/#feat=webgl
            );
  
        if (!ctx) return 0;
  
        var handle = GL.registerContext(ctx, webGLContextAttributes);
  
        return handle;
      },registerContext:function(ctx, webGLContextAttributes) {
        // with pthreads a context is a location in memory with some synchronized data between threads
        var handle = _malloc(8);
        HEAP32[(((handle)+(4))>>2)] = _pthread_self(); // the thread pointer of the thread that owns the control of the context
  
        var context = {
          handle: handle,
          attributes: webGLContextAttributes,
          version: webGLContextAttributes.majorVersion,
          GLctx: ctx
        };
  
        // Store the created context object so that we can access the context given a canvas without having to pass the parameters again.
        if (ctx.canvas) ctx.canvas.GLctxObject = context;
        GL.contexts[handle] = context;
        if (typeof webGLContextAttributes.enableExtensionsByDefault === 'undefined' || webGLContextAttributes.enableExtensionsByDefault) {
          GL.initExtensions(context);
        }
  
        return handle;
      },makeContextCurrent:function(contextHandle) {
  
        GL.currentContext = GL.contexts[contextHandle]; // Active Emscripten GL layer context object.
        Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx; // Active WebGL context object.
        return !(contextHandle && !GLctx);
      },getContext:function(contextHandle) {
        return GL.contexts[contextHandle];
      },deleteContext:function(contextHandle) {
        if (GL.currentContext === GL.contexts[contextHandle]) GL.currentContext = null;
        if (typeof JSEvents === 'object') JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas); // Release all JS event handlers on the DOM element that the GL context is associated with since the context is now deleted.
        if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined; // Make sure the canvas object no longer refers to the context object so there are no GC surprises.
        _free(GL.contexts[contextHandle].handle);
        GL.contexts[contextHandle] = null;
      },initExtensions:function(context) {
        // If this function is called without a specific context object, init the extensions of the currently active context.
        if (!context) context = GL.currentContext;
  
        if (context.initExtensionsDone) return;
        context.initExtensionsDone = true;
  
        var GLctx = context.GLctx;
  
        // Detect the presence of a few extensions manually, this GL interop layer itself will need to know if they exist.
  
        // Extensions that are only available in WebGL 1 (the calls will be no-ops if called on a WebGL 2 context active)
        __webgl_enable_ANGLE_instanced_arrays(GLctx);
        __webgl_enable_OES_vertex_array_object(GLctx);
        __webgl_enable_WEBGL_draw_buffers(GLctx);
  
        {
          GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
        }
  
        __webgl_enable_WEBGL_multi_draw(GLctx);
  
        // .getSupportedExtensions() can return null if context is lost, so coerce to empty array.
        var exts = GLctx.getSupportedExtensions() || [];
        exts.forEach(function(ext) {
          // WEBGL_lose_context, WEBGL_debug_renderer_info and WEBGL_debug_shaders are not enabled by default.
          if (!ext.includes('lose_context') && !ext.includes('debug')) {
            // Call .getExtension() to enable that extension permanently.
            GLctx.getExtension(ext);
          }
        });
      }};
  
  var __emscripten_webgl_power_preferences = ['default', 'low-power', 'high-performance'];
  function _emscripten_webgl_do_create_context(target, attributes) {
      var a = attributes >> 2;
      var powerPreference = HEAP32[a + (24>>2)];
      var contextAttributes = {
        'alpha': !!HEAP32[a + (0>>2)],
        'depth': !!HEAP32[a + (4>>2)],
        'stencil': !!HEAP32[a + (8>>2)],
        'antialias': !!HEAP32[a + (12>>2)],
        'premultipliedAlpha': !!HEAP32[a + (16>>2)],
        'preserveDrawingBuffer': !!HEAP32[a + (20>>2)],
        'powerPreference': __emscripten_webgl_power_preferences[powerPreference],
        'failIfMajorPerformanceCaveat': !!HEAP32[a + (28>>2)],
        // The following are not predefined WebGL context attributes in the WebGL specification, so the property names can be minified by Closure.
        majorVersion: HEAP32[a + (32>>2)],
        minorVersion: HEAP32[a + (36>>2)],
        enableExtensionsByDefault: HEAP32[a + (40>>2)],
        explicitSwapControl: HEAP32[a + (44>>2)],
        proxyContextToMainThread: HEAP32[a + (48>>2)],
        renderViaOffscreenBackBuffer: HEAP32[a + (52>>2)]
      };
  
      var canvas = findCanvasEventTarget(target);
  
      if (!canvas) {
        return 0;
      }
  
      if (contextAttributes.explicitSwapControl) {
        return 0;
      }
  
      var contextHandle = GL.createContext(canvas, contextAttributes);
      return contextHandle;
    }
  function _emscripten_webgl_create_context(a0,a1
  ) {
  return _emscripten_webgl_do_create_context(a0,a1);
  }

  var ENV = {};
  
  function getExecutableName() {
      return thisProgram || './this.program';
    }
  function getEnvStrings() {
      if (!getEnvStrings.strings) {
        // Default values.
        // Browser language detection #8751
        var lang = ((typeof navigator === 'object' && navigator.languages && navigator.languages[0]) || 'C').replace('-', '_') + '.UTF-8';
        var env = {
          'USER': 'web_user',
          'LOGNAME': 'web_user',
          'PATH': '/',
          'PWD': '/',
          'HOME': '/home/web_user',
          'LANG': lang,
          '_': getExecutableName()
        };
        // Apply the user-provided values, if any.
        for (var x in ENV) {
          // x is a key in ENV; if ENV[x] is undefined, that means it was
          // explicitly set to be so. We allow user code to do that to
          // force variables with default values to remain unset.
          if (ENV[x] === undefined) delete env[x];
          else env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(x + '=' + env[x]);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    }
  
  function _environ_get(__environ, environ_buf) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(31, 1, __environ, environ_buf);
    
      var bufSize = 0;
      getEnvStrings().forEach(function(string, i) {
        var ptr = environ_buf + bufSize;
        HEAP32[(((__environ)+(i * 4))>>2)] = ptr;
        writeAsciiToMemory(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    
  }
  

  
  function _environ_sizes_get(penviron_count, penviron_buf_size) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(32, 1, penviron_count, penviron_buf_size);
    
      var strings = getEnvStrings();
      HEAP32[((penviron_count)>>2)] = strings.length;
      var bufSize = 0;
      strings.forEach(function(string) {
        bufSize += string.length + 1;
      });
      HEAP32[((penviron_buf_size)>>2)] = bufSize;
      return 0;
    
  }
  


  
  function _fd_close(fd) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(33, 1, fd);
    try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.close(stream);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  
  }
  

  
  function _fd_fdstat_get(fd, pbuf) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(34, 1, fd, pbuf);
    try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      // All character devices are terminals (other things a Linux system would
      // assume is a character device, like the mouse, we have special APIs for).
      var type = stream.tty ? 2 :
                 FS.isDir(stream.mode) ? 3 :
                 FS.isLink(stream.mode) ? 7 :
                 4;
      HEAP8[((pbuf)>>0)] = type;
      // TODO HEAP16[(((pbuf)+(2))>>1)] = ?;
      // TODO (tempI64 = [?>>>0,(tempDouble=?,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((pbuf)+(8))>>2)] = tempI64[0],HEAP32[(((pbuf)+(12))>>2)] = tempI64[1]);
      // TODO (tempI64 = [?>>>0,(tempDouble=?,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((pbuf)+(16))>>2)] = tempI64[0],HEAP32[(((pbuf)+(20))>>2)] = tempI64[1]);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  
  }
  

  
  function _fd_pread(fd, iov, iovcnt, offset_low, offset_high, pnum) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(35, 1, fd, iov, iovcnt, offset_low, offset_high, pnum);
    try {
  
      
      var stream = SYSCALLS.getStreamFromFD(fd)
      var num = SYSCALLS.doReadv(stream, iov, iovcnt, offset_low);
      HEAP32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  
  }
  

  
  function _fd_pwrite(fd, iov, iovcnt, offset_low, offset_high, pnum) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(36, 1, fd, iov, iovcnt, offset_low, offset_high, pnum);
    try {
  
      
      var stream = SYSCALLS.getStreamFromFD(fd)
      var num = SYSCALLS.doWritev(stream, iov, iovcnt, offset_low);
      HEAP32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  
  }
  

  
  function _fd_read(fd, iov, iovcnt, pnum) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(37, 1, fd, iov, iovcnt, pnum);
    try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = SYSCALLS.doReadv(stream, iov, iovcnt);
      HEAP32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  
  }
  

  
  function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(38, 1, fd, offset_low, offset_high, whence, newOffset);
    try {
  
      
      var stream = SYSCALLS.getStreamFromFD(fd);
      var HIGH_OFFSET = 0x100000000; // 2^32
      // use an unsigned operator on low and shift high by 32-bits
      var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
  
      var DOUBLE_LIMIT = 0x20000000000000; // 2^53
      // we also check for equality since DOUBLE_LIMIT + 1 == DOUBLE_LIMIT
      if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
        return -61;
      }
  
      FS.llseek(stream, offset, whence);
      (tempI64 = [stream.position>>>0,(tempDouble=stream.position,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((newOffset)>>2)] = tempI64[0],HEAP32[(((newOffset)+(4))>>2)] = tempI64[1]);
      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  
  }
  

  
  function _fd_sync(fd) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(39, 1, fd);
    try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      if (stream.stream_ops && stream.stream_ops.fsync) {
        return -stream.stream_ops.fsync(stream);
      }
      return 0; // we can't do anything synchronously; the in-memory FS is already synced to
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  
  }
  

  
  function _fd_write(fd, iov, iovcnt, pnum) {
    if (ENVIRONMENT_IS_PTHREAD)
      return _emscripten_proxy_to_main_thread_js(40, 1, fd, iov, iovcnt, pnum);
    try {
  
      ;
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = SYSCALLS.doWritev(stream, iov, iovcnt);
      HEAP32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  
  }
  

  var GAI_ERRNO_MESSAGES = {};
  function _gai_strerror(val) {
      var buflen = 256;
  
      // On first call to gai_strerror we initialise the buffer and populate the error messages.
      if (!_gai_strerror.buffer) {
          _gai_strerror.buffer = _malloc(buflen);
  
          GAI_ERRNO_MESSAGES['0'] = 'Success';
          GAI_ERRNO_MESSAGES['' + -1] = 'Invalid value for \'ai_flags\' field';
          GAI_ERRNO_MESSAGES['' + -2] = 'NAME or SERVICE is unknown';
          GAI_ERRNO_MESSAGES['' + -3] = 'Temporary failure in name resolution';
          GAI_ERRNO_MESSAGES['' + -4] = 'Non-recoverable failure in name res';
          GAI_ERRNO_MESSAGES['' + -6] = '\'ai_family\' not supported';
          GAI_ERRNO_MESSAGES['' + -7] = '\'ai_socktype\' not supported';
          GAI_ERRNO_MESSAGES['' + -8] = 'SERVICE not supported for \'ai_socktype\'';
          GAI_ERRNO_MESSAGES['' + -10] = 'Memory allocation failure';
          GAI_ERRNO_MESSAGES['' + -11] = 'System error returned in \'errno\'';
          GAI_ERRNO_MESSAGES['' + -12] = 'Argument buffer overflow';
      }
  
      var msg = 'Unknown error';
  
      if (val in GAI_ERRNO_MESSAGES) {
        if (GAI_ERRNO_MESSAGES[val].length > buflen - 1) {
          msg = 'Message too long'; // EMSGSIZE message. This should never occur given the GAI_ERRNO_MESSAGES above.
        } else {
          msg = GAI_ERRNO_MESSAGES[val];
        }
      }
  
      writeAsciiToMemory(msg, _gai_strerror.buffer);
      return _gai_strerror.buffer;
    }

  function _getTempRet0() {
      return getTempRet0();
    }

  function _gettimeofday(ptr) {
      var now = Date.now();
      HEAP32[((ptr)>>2)] = (now/1000)|0; // seconds
      HEAP32[(((ptr)+(4))>>2)] = ((now % 1000)*1000)|0; // microseconds
      return 0;
    }

  function _llvm_eh_typeid_for(type) {
      return type;
    }

  var INTERNAL = {};
  var BINDING = {};
  var MONO = {};
  var DOTNET = {};
  function _mono_wasm_compile_function(
  ) {
  return __dotnet_runtime.__linker_exports.mono_wasm_compile_function.apply(__dotnet_runtime, arguments)
  }

  function _mono_wasm_create_cs_owned_object(
  ) {
  return __dotnet_runtime.__linker_exports.mono_wasm_create_cs_owned_object.apply(__dotnet_runtime, arguments)
  }

  function _mono_wasm_get_by_index(
  ) {
  return __dotnet_runtime.__linker_exports.mono_wasm_get_by_index.apply(__dotnet_runtime, arguments)
  }

  function _mono_wasm_get_global_object(
  ) {
  return __dotnet_runtime.__linker_exports.mono_wasm_get_global_object.apply(__dotnet_runtime, arguments)
  }

  function _mono_wasm_get_object_property(
  ) {
  return __dotnet_runtime.__linker_exports.mono_wasm_get_object_property.apply(__dotnet_runtime, arguments)
  }

  function _mono_wasm_invoke_js(
  ) {
  return __dotnet_runtime.__linker_exports.mono_wasm_invoke_js.apply(__dotnet_runtime, arguments)
  }

  function _mono_wasm_invoke_js_blazor(
  ) {
  return __dotnet_runtime.__linker_exports.mono_wasm_invoke_js_blazor.apply(__dotnet_runtime, arguments)
  }

  function _mono_wasm_invoke_js_with_args(
  ) {
  return __dotnet_runtime.__linker_exports.mono_wasm_invoke_js_with_args.apply(__dotnet_runtime, arguments)
  }

  function _mono_wasm_release_cs_owned_object(
  ) {
  return __dotnet_runtime.__linker_exports.mono_wasm_release_cs_owned_object.apply(__dotnet_runtime, arguments)
  }

  function _mono_wasm_set_object_property(
  ) {
  return __dotnet_runtime.__linker_exports.mono_wasm_set_object_property.apply(__dotnet_runtime, arguments)
  }

  function _mono_wasm_typed_array_from(
  ) {
  return __dotnet_runtime.__linker_exports.mono_wasm_typed_array_from.apply(__dotnet_runtime, arguments)
  }

  function _setTempRet0(val) {
      setTempRet0(val);
    }

  function __isLeapYear(year) {
        return year%4 === 0 && (year%100 !== 0 || year%400 === 0);
    }
  
  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]) {
        // no-op
      }
      return sum;
    }
  
  var __MONTH_DAYS_LEAP = [31,29,31,30,31,30,31,31,30,31,30,31];
  
  var __MONTH_DAYS_REGULAR = [31,28,31,30,31,30,31,31,30,31,30,31];
  function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while (days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
  
      return newDate;
    }
  function _strftime(s, maxsize, format, tm) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
  
      var tm_zone = HEAP32[(((tm)+(40))>>2)];
  
      var date = {
        tm_sec: HEAP32[((tm)>>2)],
        tm_min: HEAP32[(((tm)+(4))>>2)],
        tm_hour: HEAP32[(((tm)+(8))>>2)],
        tm_mday: HEAP32[(((tm)+(12))>>2)],
        tm_mon: HEAP32[(((tm)+(16))>>2)],
        tm_year: HEAP32[(((tm)+(20))>>2)],
        tm_wday: HEAP32[(((tm)+(24))>>2)],
        tm_yday: HEAP32[(((tm)+(28))>>2)],
        tm_isdst: HEAP32[(((tm)+(32))>>2)],
        tm_gmtoff: HEAP32[(((tm)+(36))>>2)],
        tm_zone: tm_zone ? UTF8ToString(tm_zone) : ''
      };
  
      var pattern = UTF8ToString(format);
  
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S',                 // Replaced by the locale's appropriate time representation
        // Modified Conversion Specifiers
        '%Ec': '%c',                      // Replaced by the locale's alternative appropriate date and time representation.
        '%EC': '%C',                      // Replaced by the name of the base year (period) in the locale's alternative representation.
        '%Ex': '%m/%d/%y',                // Replaced by the locale's alternative date representation.
        '%EX': '%H:%M:%S',                // Replaced by the locale's alternative time representation.
        '%Ey': '%y',                      // Replaced by the offset from %EC (year only) in the locale's alternative representation.
        '%EY': '%Y',                      // Replaced by the full alternative year representation.
        '%Od': '%d',                      // Replaced by the day of the month, using the locale's alternative numeric symbols, filled as needed with leading zeros if there is any alternative symbol for zero; otherwise, with leading <space> characters.
        '%Oe': '%e',                      // Replaced by the day of the month, using the locale's alternative numeric symbols, filled as needed with leading <space> characters.
        '%OH': '%H',                      // Replaced by the hour (24-hour clock) using the locale's alternative numeric symbols.
        '%OI': '%I',                      // Replaced by the hour (12-hour clock) using the locale's alternative numeric symbols.
        '%Om': '%m',                      // Replaced by the month using the locale's alternative numeric symbols.
        '%OM': '%M',                      // Replaced by the minutes using the locale's alternative numeric symbols.
        '%OS': '%S',                      // Replaced by the seconds using the locale's alternative numeric symbols.
        '%Ou': '%u',                      // Replaced by the weekday as a number in the locale's alternative representation (Monday=1).
        '%OU': '%U',                      // Replaced by the week number of the year (Sunday as the first day of the week, rules corresponding to %U ) using the locale's alternative numeric symbols.
        '%OV': '%V',                      // Replaced by the week number of the year (Monday as the first day of the week, rules corresponding to %V ) using the locale's alternative numeric symbols.
        '%Ow': '%w',                      // Replaced by the number of the weekday (Sunday=0) using the locale's alternative numeric symbols.
        '%OW': '%W',                      // Replaced by the week number of the year (Monday as the first day of the week) using the locale's alternative numeric symbols.
        '%Oy': '%y',                      // Replaced by the year (offset from %C ) using the locale's alternative numeric symbols.
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
  
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
      function leadingSomething(value, digits, character) {
        var str = typeof value === 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      }
  
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
      }
  
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        }
  
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      }
  
      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      }
  
      function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            } else {
              return thisDate.getFullYear();
            }
          } else {
            return thisDate.getFullYear()-1;
          }
      }
  
      var EXPANSION_RULES_2 = {
        '%a': function(date) {
          return WEEKDAYS[date.tm_wday].substring(0,3);
        },
        '%A': function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        '%b': function(date) {
          return MONTHS[date.tm_mon].substring(0,3);
        },
        '%B': function(date) {
          return MONTHS[date.tm_mon];
        },
        '%C': function(date) {
          var year = date.tm_year+1900;
          return leadingNulls((year/100)|0,2);
        },
        '%d': function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        '%e': function(date) {
          return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function(date) {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year.
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes
          // January 4th, which is also the week that includes the first Thursday of the year, and
          // is also the first week that contains at least four days in the year.
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of
          // the last week of the preceding year; thus, for Saturday 2nd January 1999,
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th,
          // or 31st is a Monday, it and any following days are part of week 1 of the following year.
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
  
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function(date) {
          return getWeekBasedYear(date);
        },
        '%H': function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        '%I': function(date) {
          var twelveHour = date.tm_hour;
          if (twelveHour == 0) twelveHour = 12;
          else if (twelveHour > 12) twelveHour -= 12;
          return leadingNulls(twelveHour, 2);
        },
        '%j': function(date) {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': function(date) {
          return leadingNulls(date.tm_mon+1, 2);
        },
        '%M': function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        '%n': function() {
          return '\n';
        },
        '%p': function(date) {
          if (date.tm_hour >= 0 && date.tm_hour < 12) {
            return 'AM';
          } else {
            return 'PM';
          }
        },
        '%S': function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        '%t': function() {
          return '\t';
        },
        '%u': function(date) {
          return date.tm_wday || 7;
        },
        '%U': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53].
          // The first Sunday of January is the first day of week 1;
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year+1900, 0, 1);
          var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7-janFirst.getDay());
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
  
          // is target date after the first Sunday?
          if (compareByDay(firstSunday, endDate) < 0) {
            // calculate difference in days between first Sunday and endDate
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstSundayUntilEndJanuary = 31-firstSunday.getDate();
            var days = firstSundayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
  
          return compareByDay(firstSunday, janFirst) === 0 ? '01': '00';
        },
        '%V': function(date) {
          // Replaced by the week number of the year (Monday as the first day of the week)
          // as a decimal number [01,53]. If the week containing 1 January has four
          // or more days in the new year, then it is considered week 1.
          // Otherwise, it is the last week of the previous year, and the next week is week 1.
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var janFourthThisYear = new Date(date.tm_year+1900, 0, 4);
          var janFourthNextYear = new Date(date.tm_year+1901, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          var endDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            // if given date is before this years first week, then it belongs to the 53rd week of last year
            return '53';
          }
  
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            // if given date is after next years first week, then it belongs to the 01th week of next year
            return '01';
          }
  
          // given date is in between CW 01..53 of this calendar year
          var daysDifference;
          if (firstWeekStartThisYear.getFullYear() < date.tm_year+1900) {
            // first CW of this year starts last year
            daysDifference = date.tm_yday+32-firstWeekStartThisYear.getDate()
          } else {
            // first CW of this year starts this year
            daysDifference = date.tm_yday+1-firstWeekStartThisYear.getDate();
          }
          return leadingNulls(Math.ceil(daysDifference/7), 2);
        },
        '%w': function(date) {
          return date.tm_wday;
        },
        '%W': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53].
          // The first Monday of January is the first day of week 1;
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year, 0, 1);
          var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7-janFirst.getDay()+1);
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
  
          // is target date after the first Monday?
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstMondayUntilEndJanuary = 31-firstMonday.getDate();
            var days = firstMondayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstMonday, janFirst) === 0 ? '01': '00';
        },
        '%y': function(date) {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        '%Y': function(date) {
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          return date.tm_year+1900;
        },
        '%z': function(date) {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ).
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich).
          var off = date.tm_gmtoff;
          var ahead = off >= 0;
          off = Math.abs(off) / 60;
          // convert from minutes into hhmm format (which means 60 minutes = 100 units)
          off = (off / 60)*100 + (off % 60);
          return (ahead ? '+' : '-') + String("0000" + off).slice(-4);
        },
        '%Z': function(date) {
          return date.tm_zone;
        },
        '%%': function() {
          return '%';
        }
      };
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.includes(rule)) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
  
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      }
  
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    }

  function _strftime_l(s, maxsize, format, tm) {
      return _strftime(s, maxsize, format, tm); // no locale support yet
    }

  function _time(ptr) {
      ;
      var ret = (Date.now()/1000)|0;
      if (ptr) {
        HEAP32[((ptr)>>2)] = ret;
      }
      return ret;
    }

if (!ENVIRONMENT_IS_PTHREAD) PThread.initMainThread();;

  var FSNode = /** @constructor */ function(parent, name, mode, rdev) {
    if (!parent) {
      parent = this;  // root node sets parent to itself
    }
    this.parent = parent;
    this.mount = parent.mount;
    this.mounted = null;
    this.id = FS.nextInode++;
    this.name = name;
    this.mode = mode;
    this.node_ops = {};
    this.stream_ops = {};
    this.rdev = rdev;
  };
  var readMode = 292/*292*/ | 73/*73*/;
  var writeMode = 146/*146*/;
  Object.defineProperties(FSNode.prototype, {
   read: {
    get: /** @this{FSNode} */function() {
     return (this.mode & readMode) === readMode;
    },
    set: /** @this{FSNode} */function(val) {
     val ? this.mode |= readMode : this.mode &= ~readMode;
    }
   },
   write: {
    get: /** @this{FSNode} */function() {
     return (this.mode & writeMode) === writeMode;
    },
    set: /** @this{FSNode} */function(val) {
     val ? this.mode |= writeMode : this.mode &= ~writeMode;
    }
   },
   isFolder: {
    get: /** @this{FSNode} */function() {
     return FS.isDir(this.mode);
    }
   },
   isDevice: {
    get: /** @this{FSNode} */function() {
     return FS.isChrdev(this.mode);
    }
   }
  });
  FS.FSNode = FSNode;
  FS.staticInit();Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createDevice"] = FS.createDevice;Module["FS_unlink"] = FS.unlink;;
Module["requestFullscreen"] = function Module_requestFullscreen(lockPointer, resizeCanvas) { Browser.requestFullscreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
  Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) { return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes) };
var GLctx;;
__dotnet_runtime.__initializeImportsAndExports({isGlobal:true, isNode:ENVIRONMENT_IS_NODE, isShell:ENVIRONMENT_IS_SHELL, isWeb:ENVIRONMENT_IS_WEB, locateFile}, {mono:MONO, binding:BINDING, internal:INTERNAL, module:Module});;

 // proxiedFunctionTable specifies the list of functions that can be called either synchronously or asynchronously from other threads in postMessage()d or internally queued events. This way a pthread in a Worker can synchronously access e.g. the DOM on the main thread.

var proxiedFunctionTable = [null,exitOnMainThread,___syscall_access,___syscall_chdir,___syscall_chmod,___syscall_connect,___syscall_fchmod,___syscall_fcntl64,___syscall_fstat64,___syscall_fstatat64,___syscall_fstatfs64,___syscall_statfs64,___syscall_ftruncate64,___syscall_getcwd,___syscall_getdents64,___syscall_lstat64,___syscall_mkdir,___syscall_mmap2,___syscall_msync,___syscall_munmap,___syscall_open,___syscall_readlink,___syscall_rename,___syscall_rmdir,___syscall_sendto,___syscall_socket,___syscall_stat64,___syscall_symlink,___syscall_unlink,___syscall_utimensat,_emscripten_set_canvas_element_size_main_thread,_environ_get,_environ_sizes_get,_fd_close,_fd_fdstat_get,_fd_pread,_fd_pwrite,_fd_read,_fd_seek,_fd_sync,_fd_write];

var ASSERTIONS = false;



/** @type {function(string, boolean=, number=)} */
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      if (ASSERTIONS) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      }
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}


// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

/**
 * Decodes a base64 string.
 * @param {string} input The string to decode.
 */
var decodeBase64 = typeof atob === 'function' ? atob : function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  var output = '';
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return output;
};

// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s) {
  if (typeof ENVIRONMENT_IS_NODE === 'boolean' && ENVIRONMENT_IS_NODE) {
    var buf = Buffer.from(s, 'base64');
    return new Uint8Array(buf['buffer'], buf['byteOffset'], buf['byteLength']);
  }

  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0 ; i < decoded.length ; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}


var asmLibraryArg = {
  "__clock_gettime": ___clock_gettime,
  "__cxa_allocate_exception": ___cxa_allocate_exception,
  "__cxa_begin_catch": ___cxa_begin_catch,
  "__cxa_current_primary_exception": ___cxa_current_primary_exception,
  "__cxa_decrement_exception_refcount": ___cxa_decrement_exception_refcount,
  "__cxa_end_catch": ___cxa_end_catch,
  "__cxa_find_matching_catch_2": ___cxa_find_matching_catch_2,
  "__cxa_find_matching_catch_3": ___cxa_find_matching_catch_3,
  "__cxa_find_matching_catch_4": ___cxa_find_matching_catch_4,
  "__cxa_find_matching_catch_5": ___cxa_find_matching_catch_5,
  "__cxa_free_exception": ___cxa_free_exception,
  "__cxa_increment_exception_refcount": ___cxa_increment_exception_refcount,
  "__cxa_rethrow": ___cxa_rethrow,
  "__cxa_rethrow_primary_exception": ___cxa_rethrow_primary_exception,
  "__cxa_throw": ___cxa_throw,
  "__cxa_uncaught_exceptions": ___cxa_uncaught_exceptions,
  "__emscripten_init_main_thread_js": ___emscripten_init_main_thread_js,
  "__emscripten_thread_cleanup": ___emscripten_thread_cleanup,
  "__pthread_create_js": ___pthread_create_js,
  "__resumeException": ___resumeException,
  "__syscall_access": ___syscall_access,
  "__syscall_chdir": ___syscall_chdir,
  "__syscall_chmod": ___syscall_chmod,
  "__syscall_connect": ___syscall_connect,
  "__syscall_fadvise64_64": ___syscall_fadvise64_64,
  "__syscall_fchmod": ___syscall_fchmod,
  "__syscall_fcntl64": ___syscall_fcntl64,
  "__syscall_fstat64": ___syscall_fstat64,
  "__syscall_fstatat64": ___syscall_fstatat64,
  "__syscall_fstatfs64": ___syscall_fstatfs64,
  "__syscall_ftruncate64": ___syscall_ftruncate64,
  "__syscall_getcwd": ___syscall_getcwd,
  "__syscall_getdents64": ___syscall_getdents64,
  "__syscall_lstat64": ___syscall_lstat64,
  "__syscall_mkdir": ___syscall_mkdir,
  "__syscall_mmap2": ___syscall_mmap2,
  "__syscall_msync": ___syscall_msync,
  "__syscall_munmap": ___syscall_munmap,
  "__syscall_open": ___syscall_open,
  "__syscall_readlink": ___syscall_readlink,
  "__syscall_rename": ___syscall_rename,
  "__syscall_rmdir": ___syscall_rmdir,
  "__syscall_sendto": ___syscall_sendto,
  "__syscall_socket": ___syscall_socket,
  "__syscall_stat64": ___syscall_stat64,
  "__syscall_symlink": ___syscall_symlink,
  "__syscall_unlink": ___syscall_unlink,
  "__syscall_utimensat": ___syscall_utimensat,
  "_emscripten_default_pthread_stack_size": __emscripten_default_pthread_stack_size,
  "_emscripten_futex_wait_non_blocking": __emscripten_futex_wait_non_blocking,
  "_emscripten_notify_thread_queue": __emscripten_notify_thread_queue,
  "_gmtime_js": __gmtime_js,
  "abort": _abort,
  "clock_gettime": _clock_gettime,
  "dotnet_browser_entropy": _dotnet_browser_entropy,
  "emscripten_async_call": _emscripten_async_call,
  "emscripten_check_blocking_allowed": _emscripten_check_blocking_allowed,
  "emscripten_get_heap_max": _emscripten_get_heap_max,
  "emscripten_get_now": _emscripten_get_now,
  "emscripten_memcpy_big": _emscripten_memcpy_big,
  "emscripten_num_logical_cores": _emscripten_num_logical_cores,
  "emscripten_receive_on_main_thread_js": _emscripten_receive_on_main_thread_js,
  "emscripten_resize_heap": _emscripten_resize_heap,
  "emscripten_set_canvas_element_size": _emscripten_set_canvas_element_size,
  "emscripten_unwind_to_js_event_loop": _emscripten_unwind_to_js_event_loop,
  "emscripten_webgl_create_context": _emscripten_webgl_create_context,
  "environ_get": _environ_get,
  "environ_sizes_get": _environ_sizes_get,
  "exit": _exit,
  "fd_close": _fd_close,
  "fd_fdstat_get": _fd_fdstat_get,
  "fd_pread": _fd_pread,
  "fd_pwrite": _fd_pwrite,
  "fd_read": _fd_read,
  "fd_seek": _fd_seek,
  "fd_sync": _fd_sync,
  "fd_write": _fd_write,
  "gai_strerror": _gai_strerror,
  "getTempRet0": _getTempRet0,
  "gettimeofday": _gettimeofday,
  "invoke_diii": invoke_diii,
  "invoke_fi": invoke_fi,
  "invoke_fiii": invoke_fiii,
  "invoke_i": invoke_i,
  "invoke_ii": invoke_ii,
  "invoke_iii": invoke_iii,
  "invoke_iiidi": invoke_iiidi,
  "invoke_iiif": invoke_iiif,
  "invoke_iiii": invoke_iiii,
  "invoke_iiiii": invoke_iiiii,
  "invoke_iiiiii": invoke_iiiiii,
  "invoke_iiiiiii": invoke_iiiiiii,
  "invoke_iiiiiiii": invoke_iiiiiiii,
  "invoke_iiiiiiiii": invoke_iiiiiiiii,
  "invoke_iiiiiiiiii": invoke_iiiiiiiiii,
  "invoke_iiiiiiiiiiii": invoke_iiiiiiiiiiii,
  "invoke_iiiiiiiiiiiiiiiiiiiiiiii": invoke_iiiiiiiiiiiiiiiiiiiiiiii,
  "invoke_iiiiiiij": invoke_iiiiiiij,
  "invoke_iiiiiij": invoke_iiiiiij,
  "invoke_iiiiiji": invoke_iiiiiji,
  "invoke_iiiij": invoke_iiiij,
  "invoke_iiiijiiii": invoke_iiiijiiii,
  "invoke_iiiijiiiii": invoke_iiiijiiiii,
  "invoke_iiij": invoke_iiij,
  "invoke_iiiji": invoke_iiiji,
  "invoke_iij": invoke_iij,
  "invoke_iiji": invoke_iiji,
  "invoke_iijii": invoke_iijii,
  "invoke_iijiii": invoke_iijiii,
  "invoke_iijiiiiiii": invoke_iijiiiiiii,
  "invoke_iijj": invoke_iijj,
  "invoke_iijji": invoke_iijji,
  "invoke_j": invoke_j,
  "invoke_jd": invoke_jd,
  "invoke_ji": invoke_ji,
  "invoke_jii": invoke_jii,
  "invoke_jiii": invoke_jiii,
  "invoke_jiiii": invoke_jiiii,
  "invoke_jiiiiiiiii": invoke_jiiiiiiiii,
  "invoke_jiiij": invoke_jiiij,
  "invoke_jiij": invoke_jiij,
  "invoke_jiji": invoke_jiji,
  "invoke_jjiii": invoke_jjiii,
  "invoke_v": invoke_v,
  "invoke_vdddddddddii": invoke_vdddddddddii,
  "invoke_vdi": invoke_vdi,
  "invoke_vdiii": invoke_vdiii,
  "invoke_vff": invoke_vff,
  "invoke_vi": invoke_vi,
  "invoke_vid": invoke_vid,
  "invoke_vii": invoke_vii,
  "invoke_viid": invoke_viid,
  "invoke_viidi": invoke_viidi,
  "invoke_viif": invoke_viif,
  "invoke_viii": invoke_viii,
  "invoke_viiif": invoke_viiif,
  "invoke_viiii": invoke_viiii,
  "invoke_viiiif": invoke_viiiif,
  "invoke_viiiii": invoke_viiiii,
  "invoke_viiiiii": invoke_viiiiii,
  "invoke_viiiiiii": invoke_viiiiiii,
  "invoke_viiiiiiii": invoke_viiiiiiii,
  "invoke_viiiiiiiiii": invoke_viiiiiiiiii,
  "invoke_viiiiiiiiiiiiiii": invoke_viiiiiiiiiiiiiii,
  "invoke_viiiiiij": invoke_viiiiiij,
  "invoke_viiijjii": invoke_viiijjii,
  "invoke_viij": invoke_viij,
  "invoke_viijiii": invoke_viijiii,
  "invoke_viijiiiiii": invoke_viijiiiiii,
  "invoke_viijj": invoke_viijj,
  "invoke_vij": invoke_vij,
  "invoke_vijiiij": invoke_vijiiij,
  "invoke_vijj": invoke_vijj,
  "invoke_vji": invoke_vji,
  "invoke_vjii": invoke_vjii,
  "llvm_eh_typeid_for": _llvm_eh_typeid_for,
  "memory": wasmMemory,
  "mono_wasm_compile_function": _mono_wasm_compile_function,
  "mono_wasm_create_cs_owned_object": _mono_wasm_create_cs_owned_object,
  "mono_wasm_get_by_index": _mono_wasm_get_by_index,
  "mono_wasm_get_global_object": _mono_wasm_get_global_object,
  "mono_wasm_get_object_property": _mono_wasm_get_object_property,
  "mono_wasm_invoke_js": _mono_wasm_invoke_js,
  "mono_wasm_invoke_js_blazor": _mono_wasm_invoke_js_blazor,
  "mono_wasm_invoke_js_with_args": _mono_wasm_invoke_js_with_args,
  "mono_wasm_release_cs_owned_object": _mono_wasm_release_cs_owned_object,
  "mono_wasm_set_object_property": _mono_wasm_set_object_property,
  "mono_wasm_typed_array_from": _mono_wasm_typed_array_from,
  "setTempRet0": _setTempRet0,
  "strftime": _strftime,
  "strftime_l": _strftime_l,
  "time": _time
};
var asm = createWasm();
/** @type {function(...*):?} */
var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function() {
  return (___wasm_call_ctors = Module["___wasm_call_ctors"] = Module["asm"]["__wasm_call_ctors"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var ___errno_location = Module["___errno_location"] = function() {
  return (___errno_location = Module["___errno_location"] = Module["asm"]["__errno_location"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _pthread_self = Module["_pthread_self"] = function() {
  return (_pthread_self = Module["_pthread_self"] = Module["asm"]["pthread_self"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _il2cxx_wasm_slot_set = Module["_il2cxx_wasm_slot_set"] = function() {
  return (_il2cxx_wasm_slot_set = Module["_il2cxx_wasm_slot_set"] = Module["asm"]["il2cxx_wasm_slot_set"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_add_assembly = Module["_mono_wasm_add_assembly"] = function() {
  return (_mono_wasm_add_assembly = Module["_mono_wasm_add_assembly"] = Module["asm"]["mono_wasm_add_assembly"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_add_satellite_assembly = Module["_mono_wasm_add_satellite_assembly"] = function() {
  return (_mono_wasm_add_satellite_assembly = Module["_mono_wasm_add_satellite_assembly"] = Module["asm"]["mono_wasm_add_satellite_assembly"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_setenv = Module["_mono_wasm_setenv"] = function() {
  return (_mono_wasm_setenv = Module["_mono_wasm_setenv"] = Module["asm"]["mono_wasm_setenv"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_register_bundled_satellite_assemblies = Module["_mono_wasm_register_bundled_satellite_assemblies"] = function() {
  return (_mono_wasm_register_bundled_satellite_assemblies = Module["_mono_wasm_register_bundled_satellite_assemblies"] = Module["asm"]["mono_wasm_register_bundled_satellite_assemblies"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_load_runtime = Module["_mono_wasm_load_runtime"] = function() {
  return (_mono_wasm_load_runtime = Module["_mono_wasm_load_runtime"] = Module["asm"]["mono_wasm_load_runtime"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_assembly_load = Module["_mono_wasm_assembly_load"] = function() {
  return (_mono_wasm_assembly_load = Module["_mono_wasm_assembly_load"] = Module["asm"]["mono_wasm_assembly_load"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_get_corlib = Module["_mono_wasm_get_corlib"] = function() {
  return (_mono_wasm_get_corlib = Module["_mono_wasm_get_corlib"] = Module["asm"]["mono_wasm_get_corlib"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_assembly_find_class = Module["_mono_wasm_assembly_find_class"] = function() {
  return (_mono_wasm_assembly_find_class = Module["_mono_wasm_assembly_find_class"] = Module["asm"]["mono_wasm_assembly_find_class"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_assembly_find_method = Module["_mono_wasm_assembly_find_method"] = function() {
  return (_mono_wasm_assembly_find_method = Module["_mono_wasm_assembly_find_method"] = Module["asm"]["mono_wasm_assembly_find_method"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_get_delegate_invoke = Module["_mono_wasm_get_delegate_invoke"] = function() {
  return (_mono_wasm_get_delegate_invoke = Module["_mono_wasm_get_delegate_invoke"] = Module["asm"]["mono_wasm_get_delegate_invoke"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_box_primitive = Module["_mono_wasm_box_primitive"] = function() {
  return (_mono_wasm_box_primitive = Module["_mono_wasm_box_primitive"] = Module["asm"]["mono_wasm_box_primitive"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_invoke_method = Module["_mono_wasm_invoke_method"] = function() {
  return (_mono_wasm_invoke_method = Module["_mono_wasm_invoke_method"] = Module["asm"]["mono_wasm_invoke_method"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_assembly_get_entry_point = Module["_mono_wasm_assembly_get_entry_point"] = function() {
  return (_mono_wasm_assembly_get_entry_point = Module["_mono_wasm_assembly_get_entry_point"] = Module["asm"]["mono_wasm_assembly_get_entry_point"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_string_get_utf8 = Module["_mono_wasm_string_get_utf8"] = function() {
  return (_mono_wasm_string_get_utf8 = Module["_mono_wasm_string_get_utf8"] = Module["asm"]["mono_wasm_string_get_utf8"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_string_from_js = Module["_mono_wasm_string_from_js"] = function() {
  return (_mono_wasm_string_from_js = Module["_mono_wasm_string_from_js"] = Module["asm"]["mono_wasm_string_from_js"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_string_from_utf16 = Module["_mono_wasm_string_from_utf16"] = function() {
  return (_mono_wasm_string_from_utf16 = Module["_mono_wasm_string_from_utf16"] = Module["asm"]["mono_wasm_string_from_utf16"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_get_obj_class = Module["_mono_wasm_get_obj_class"] = function() {
  return (_mono_wasm_get_obj_class = Module["_mono_wasm_get_obj_class"] = Module["asm"]["mono_wasm_get_obj_class"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_try_unbox_primitive_and_get_type = Module["_mono_wasm_try_unbox_primitive_and_get_type"] = function() {
  return (_mono_wasm_try_unbox_primitive_and_get_type = Module["_mono_wasm_try_unbox_primitive_and_get_type"] = Module["asm"]["mono_wasm_try_unbox_primitive_and_get_type"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_array_length = Module["_mono_wasm_array_length"] = function() {
  return (_mono_wasm_array_length = Module["_mono_wasm_array_length"] = Module["asm"]["mono_wasm_array_length"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_array_get = Module["_mono_wasm_array_get"] = function() {
  return (_mono_wasm_array_get = Module["_mono_wasm_array_get"] = Module["asm"]["mono_wasm_array_get"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_obj_array_new = Module["_mono_wasm_obj_array_new"] = function() {
  return (_mono_wasm_obj_array_new = Module["_mono_wasm_obj_array_new"] = Module["asm"]["mono_wasm_obj_array_new"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_obj_array_set = Module["_mono_wasm_obj_array_set"] = function() {
  return (_mono_wasm_obj_array_set = Module["_mono_wasm_obj_array_set"] = Module["asm"]["mono_wasm_obj_array_set"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_string_array_new = Module["_mono_wasm_string_array_new"] = function() {
  return (_mono_wasm_string_array_new = Module["_mono_wasm_string_array_new"] = Module["asm"]["mono_wasm_string_array_new"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_exec_regression = Module["_mono_wasm_exec_regression"] = function() {
  return (_mono_wasm_exec_regression = Module["_mono_wasm_exec_regression"] = Module["asm"]["mono_wasm_exec_regression"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_exit = Module["_mono_wasm_exit"] = function() {
  return (_mono_wasm_exit = Module["_mono_wasm_exit"] = Module["asm"]["mono_wasm_exit"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_set_main_args = Module["_mono_wasm_set_main_args"] = function() {
  return (_mono_wasm_set_main_args = Module["_mono_wasm_set_main_args"] = Module["asm"]["mono_wasm_set_main_args"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_strdup = Module["_mono_wasm_strdup"] = function() {
  return (_mono_wasm_strdup = Module["_mono_wasm_strdup"] = Module["asm"]["mono_wasm_strdup"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_parse_runtime_options = Module["_mono_wasm_parse_runtime_options"] = function() {
  return (_mono_wasm_parse_runtime_options = Module["_mono_wasm_parse_runtime_options"] = Module["asm"]["mono_wasm_parse_runtime_options"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_enable_on_demand_gc = Module["_mono_wasm_enable_on_demand_gc"] = function() {
  return (_mono_wasm_enable_on_demand_gc = Module["_mono_wasm_enable_on_demand_gc"] = Module["asm"]["mono_wasm_enable_on_demand_gc"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_intern_string = Module["_mono_wasm_intern_string"] = function() {
  return (_mono_wasm_intern_string = Module["_mono_wasm_intern_string"] = Module["asm"]["mono_wasm_intern_string"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_string_get_data = Module["_mono_wasm_string_get_data"] = function() {
  return (_mono_wasm_string_get_data = Module["_mono_wasm_string_get_data"] = Module["asm"]["mono_wasm_string_get_data"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_unbox_rooted = Module["_mono_wasm_unbox_rooted"] = function() {
  return (_mono_wasm_unbox_rooted = Module["_mono_wasm_unbox_rooted"] = Module["asm"]["mono_wasm_unbox_rooted"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_load_icu_data = Module["_mono_wasm_load_icu_data"] = function() {
  return (_mono_wasm_load_icu_data = Module["_mono_wasm_load_icu_data"] = Module["asm"]["mono_wasm_load_icu_data"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _mono_wasm_typed_array_new = Module["_mono_wasm_typed_array_new"] = function() {
  return (_mono_wasm_typed_array_new = Module["_mono_wasm_typed_array_new"] = Module["asm"]["mono_wasm_typed_array_new"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _free = Module["_free"] = function() {
  return (_free = Module["_free"] = Module["asm"]["free"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _malloc = Module["_malloc"] = function() {
  return (_malloc = Module["_malloc"] = Module["asm"]["malloc"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _ntohs = Module["_ntohs"] = function() {
  return (_ntohs = Module["_ntohs"] = Module["asm"]["ntohs"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _htons = Module["_htons"] = function() {
  return (_htons = Module["_htons"] = Module["asm"]["htons"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_tls_init = Module["_emscripten_tls_init"] = function() {
  return (_emscripten_tls_init = Module["_emscripten_tls_init"] = Module["asm"]["emscripten_tls_init"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var __emscripten_thread_init = Module["__emscripten_thread_init"] = function() {
  return (__emscripten_thread_init = Module["__emscripten_thread_init"] = Module["asm"]["_emscripten_thread_init"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_main_thread_process_queued_calls = Module["_emscripten_main_thread_process_queued_calls"] = function() {
  return (_emscripten_main_thread_process_queued_calls = Module["_emscripten_main_thread_process_queued_calls"] = Module["asm"]["emscripten_main_thread_process_queued_calls"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _htonl = Module["_htonl"] = function() {
  return (_htonl = Module["_htonl"] = Module["asm"]["htonl"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_current_thread_process_queued_calls = Module["_emscripten_current_thread_process_queued_calls"] = function() {
  return (_emscripten_current_thread_process_queued_calls = Module["_emscripten_current_thread_process_queued_calls"] = Module["asm"]["emscripten_current_thread_process_queued_calls"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_main_browser_thread_id = Module["_emscripten_main_browser_thread_id"] = function() {
  return (_emscripten_main_browser_thread_id = Module["_emscripten_main_browser_thread_id"] = Module["asm"]["emscripten_main_browser_thread_id"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_sync_run_in_main_thread_2 = Module["_emscripten_sync_run_in_main_thread_2"] = function() {
  return (_emscripten_sync_run_in_main_thread_2 = Module["_emscripten_sync_run_in_main_thread_2"] = Module["asm"]["emscripten_sync_run_in_main_thread_2"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_sync_run_in_main_thread_4 = Module["_emscripten_sync_run_in_main_thread_4"] = function() {
  return (_emscripten_sync_run_in_main_thread_4 = Module["_emscripten_sync_run_in_main_thread_4"] = Module["asm"]["emscripten_sync_run_in_main_thread_4"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_run_in_main_runtime_thread_js = Module["_emscripten_run_in_main_runtime_thread_js"] = function() {
  return (_emscripten_run_in_main_runtime_thread_js = Module["_emscripten_run_in_main_runtime_thread_js"] = Module["asm"]["emscripten_run_in_main_runtime_thread_js"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_dispatch_to_thread_ = Module["_emscripten_dispatch_to_thread_"] = function() {
  return (_emscripten_dispatch_to_thread_ = Module["_emscripten_dispatch_to_thread_"] = Module["asm"]["emscripten_dispatch_to_thread_"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var __emscripten_thread_free_data = Module["__emscripten_thread_free_data"] = function() {
  return (__emscripten_thread_free_data = Module["__emscripten_thread_free_data"] = Module["asm"]["_emscripten_thread_free_data"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var __emscripten_thread_exit = Module["__emscripten_thread_exit"] = function() {
  return (__emscripten_thread_exit = Module["__emscripten_thread_exit"] = Module["asm"]["_emscripten_thread_exit"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _memalign = Module["_memalign"] = function() {
  return (_memalign = Module["_memalign"] = Module["asm"]["memalign"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _setThrew = Module["_setThrew"] = function() {
  return (_setThrew = Module["_setThrew"] = Module["asm"]["setThrew"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _emscripten_stack_set_limits = Module["_emscripten_stack_set_limits"] = function() {
  return (_emscripten_stack_set_limits = Module["_emscripten_stack_set_limits"] = Module["asm"]["emscripten_stack_set_limits"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var stackSave = Module["stackSave"] = function() {
  return (stackSave = Module["stackSave"] = Module["asm"]["stackSave"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var stackRestore = Module["stackRestore"] = function() {
  return (stackRestore = Module["stackRestore"] = Module["asm"]["stackRestore"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var stackAlloc = Module["stackAlloc"] = function() {
  return (stackAlloc = Module["stackAlloc"] = Module["asm"]["stackAlloc"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var ___cxa_can_catch = Module["___cxa_can_catch"] = function() {
  return (___cxa_can_catch = Module["___cxa_can_catch"] = Module["asm"]["__cxa_can_catch"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = function() {
  return (___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = Module["asm"]["__cxa_is_pointer_type"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_jiii = Module["dynCall_jiii"] = function() {
  return (dynCall_jiii = Module["dynCall_jiii"] = Module["asm"]["dynCall_jiii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_jii = Module["dynCall_jii"] = function() {
  return (dynCall_jii = Module["dynCall_jii"] = Module["asm"]["dynCall_jii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_ji = Module["dynCall_ji"] = function() {
  return (dynCall_ji = Module["dynCall_ji"] = Module["asm"]["dynCall_ji"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_vij = Module["dynCall_vij"] = function() {
  return (dynCall_vij = Module["dynCall_vij"] = Module["asm"]["dynCall_vij"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iiiiiij = Module["dynCall_iiiiiij"] = function() {
  return (dynCall_iiiiiij = Module["dynCall_iiiiiij"] = Module["asm"]["dynCall_iiiiiij"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iiji = Module["dynCall_iiji"] = function() {
  return (dynCall_iiji = Module["dynCall_iiji"] = Module["asm"]["dynCall_iiji"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iiiiiiij = Module["dynCall_iiiiiiij"] = function() {
  return (dynCall_iiiiiiij = Module["dynCall_iiiiiiij"] = Module["asm"]["dynCall_iiiiiiij"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iiiij = Module["dynCall_iiiij"] = function() {
  return (dynCall_iiiij = Module["dynCall_iiiij"] = Module["asm"]["dynCall_iiiij"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iiiiiji = Module["dynCall_iiiiiji"] = function() {
  return (dynCall_iiiiiji = Module["dynCall_iiiiiji"] = Module["asm"]["dynCall_iiiiiji"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iij = Module["dynCall_iij"] = function() {
  return (dynCall_iij = Module["dynCall_iij"] = Module["asm"]["dynCall_iij"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iijii = Module["dynCall_iijii"] = function() {
  return (dynCall_iijii = Module["dynCall_iijii"] = Module["asm"]["dynCall_iijii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iijiii = Module["dynCall_iijiii"] = function() {
  return (dynCall_iijiii = Module["dynCall_iijiii"] = Module["asm"]["dynCall_iijiii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_j = Module["dynCall_j"] = function() {
  return (dynCall_j = Module["dynCall_j"] = Module["asm"]["dynCall_j"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_jjiii = Module["dynCall_jjiii"] = function() {
  return (dynCall_jjiii = Module["dynCall_jjiii"] = Module["asm"]["dynCall_jjiii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_jd = Module["dynCall_jd"] = function() {
  return (dynCall_jd = Module["dynCall_jd"] = Module["asm"]["dynCall_jd"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iiiji = Module["dynCall_iiiji"] = function() {
  return (dynCall_iiiji = Module["dynCall_iiiji"] = Module["asm"]["dynCall_iiiji"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_jiji = Module["dynCall_jiji"] = function() {
  return (dynCall_jiji = Module["dynCall_jiji"] = Module["asm"]["dynCall_jiji"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_viij = Module["dynCall_viij"] = function() {
  return (dynCall_viij = Module["dynCall_viij"] = Module["asm"]["dynCall_viij"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_vji = Module["dynCall_vji"] = function() {
  return (dynCall_vji = Module["dynCall_vji"] = Module["asm"]["dynCall_vji"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iiiiij = Module["dynCall_iiiiij"] = function() {
  return (dynCall_iiiiij = Module["dynCall_iiiiij"] = Module["asm"]["dynCall_iiiiij"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_vijiiij = Module["dynCall_vijiiij"] = function() {
  return (dynCall_vijiiij = Module["dynCall_vijiiij"] = Module["asm"]["dynCall_vijiiij"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_viijii = Module["dynCall_viijii"] = function() {
  return (dynCall_viijii = Module["dynCall_viijii"] = Module["asm"]["dynCall_viijii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_viijiii = Module["dynCall_viijiii"] = function() {
  return (dynCall_viijiii = Module["dynCall_viijiii"] = Module["asm"]["dynCall_viijiii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iiij = Module["dynCall_iiij"] = function() {
  return (dynCall_iiij = Module["dynCall_iiij"] = Module["asm"]["dynCall_iiij"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_jiij = Module["dynCall_jiij"] = function() {
  return (dynCall_jiij = Module["dynCall_jiij"] = Module["asm"]["dynCall_jiij"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_viji = Module["dynCall_viji"] = function() {
  return (dynCall_viji = Module["dynCall_viji"] = Module["asm"]["dynCall_viji"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_vijii = Module["dynCall_vijii"] = function() {
  return (dynCall_vijii = Module["dynCall_vijii"] = Module["asm"]["dynCall_vijii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iijji = Module["dynCall_iijji"] = function() {
  return (dynCall_iijji = Module["dynCall_iijji"] = Module["asm"]["dynCall_iijji"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iiiiijii = Module["dynCall_iiiiijii"] = function() {
  return (dynCall_iiiiijii = Module["dynCall_iiiiijii"] = Module["asm"]["dynCall_iiiiijii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_vijj = Module["dynCall_vijj"] = function() {
  return (dynCall_vijj = Module["dynCall_vijj"] = Module["asm"]["dynCall_vijj"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_vijji = Module["dynCall_vijji"] = function() {
  return (dynCall_vijji = Module["dynCall_vijji"] = Module["asm"]["dynCall_vijji"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_viiji = Module["dynCall_viiji"] = function() {
  return (dynCall_viiji = Module["dynCall_viiji"] = Module["asm"]["dynCall_viiji"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iijj = Module["dynCall_iijj"] = function() {
  return (dynCall_iijj = Module["dynCall_iijj"] = Module["asm"]["dynCall_iijj"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iiiijiiii = Module["dynCall_iiiijiiii"] = function() {
  return (dynCall_iiiijiiii = Module["dynCall_iiiijiiii"] = Module["asm"]["dynCall_iiiijiiii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iijiiiiiii = Module["dynCall_iijiiiiiii"] = function() {
  return (dynCall_iijiiiiiii = Module["dynCall_iijiiiiiii"] = Module["asm"]["dynCall_iijiiiiiii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iiiijiiiii = Module["dynCall_iiiijiiiii"] = function() {
  return (dynCall_iiiijiiiii = Module["dynCall_iiiijiiiii"] = Module["asm"]["dynCall_iiiijiiiii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_ij = Module["dynCall_ij"] = function() {
  return (dynCall_ij = Module["dynCall_ij"] = Module["asm"]["dynCall_ij"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_jj = Module["dynCall_jj"] = function() {
  return (dynCall_jj = Module["dynCall_jj"] = Module["asm"]["dynCall_jj"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_jiiiiiiiii = Module["dynCall_jiiiiiiiii"] = function() {
  return (dynCall_jiiiiiiiii = Module["dynCall_jiiiiiiiii"] = Module["asm"]["dynCall_jiiiiiiiii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_jjj = Module["dynCall_jjj"] = function() {
  return (dynCall_jjj = Module["dynCall_jjj"] = Module["asm"]["dynCall_jjj"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_jji = Module["dynCall_jji"] = function() {
  return (dynCall_jji = Module["dynCall_jji"] = Module["asm"]["dynCall_jji"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_ijj = Module["dynCall_ijj"] = function() {
  return (dynCall_ijj = Module["dynCall_ijj"] = Module["asm"]["dynCall_ijj"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_jjjj = Module["dynCall_jjjj"] = function() {
  return (dynCall_jjjj = Module["dynCall_jjjj"] = Module["asm"]["dynCall_jjjj"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_jiiij = Module["dynCall_jiiij"] = function() {
  return (dynCall_jiiij = Module["dynCall_jiiij"] = Module["asm"]["dynCall_jiiij"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_viiiiiij = Module["dynCall_viiiiiij"] = function() {
  return (dynCall_viiiiiij = Module["dynCall_viiiiiij"] = Module["asm"]["dynCall_viiiiiij"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_viijj = Module["dynCall_viijj"] = function() {
  return (dynCall_viijj = Module["dynCall_viijj"] = Module["asm"]["dynCall_viijj"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iiijii = Module["dynCall_iiijii"] = function() {
  return (dynCall_iiijii = Module["dynCall_iiijii"] = Module["asm"]["dynCall_iiijii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_jiiii = Module["dynCall_jiiii"] = function() {
  return (dynCall_jiiii = Module["dynCall_jiiii"] = Module["asm"]["dynCall_jiiii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_viijiiiiii = Module["dynCall_viijiiiiii"] = function() {
  return (dynCall_viijiiiiii = Module["dynCall_viijiiiiii"] = Module["asm"]["dynCall_viijiiiiii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_viiiijjii = Module["dynCall_viiiijjii"] = function() {
  return (dynCall_viiiijjii = Module["dynCall_viiiijjii"] = Module["asm"]["dynCall_viiiijjii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iijiiij = Module["dynCall_iijiiij"] = function() {
  return (dynCall_iijiiij = Module["dynCall_iijiiij"] = Module["asm"]["dynCall_iijiiij"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iiiiijj = Module["dynCall_iiiiijj"] = function() {
  return (dynCall_iiiiijj = Module["dynCall_iiiiijj"] = Module["asm"]["dynCall_iiiiijj"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = function() {
  return (dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = Module["asm"]["dynCall_iiiiiijj"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_vjii = Module["dynCall_vjii"] = function() {
  return (dynCall_vjii = Module["dynCall_vjii"] = Module["asm"]["dynCall_vjii"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_viiijjii = Module["dynCall_viiijjii"] = function() {
  return (dynCall_viiijjii = Module["dynCall_viiijjii"] = Module["asm"]["dynCall_viiijjii"]).apply(null, arguments);
};

var __emscripten_main_thread_futex = Module['__emscripten_main_thread_futex'] = 51063084;
var __emscripten_allow_main_runtime_queued_calls = Module['__emscripten_allow_main_runtime_queued_calls'] = 47450464;
function invoke_iii(index,a1,a2) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)(a1,a2);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_ii(index,a1) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)(a1);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_vi(index,a1) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viii(index,a1,a2,a3) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2,a3);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiii(index,a1,a2,a3) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)(a1,a2,a3);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_v(index) {
var sp = stackSave();
try {
  getWasmTableEntry(index)();
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_vii(index,a1,a2) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiiiiii(index,a1,a2,a3,a4,a5,a6) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_i(index) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)();
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiiii(index,a1,a2,a3,a4) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)(a1,a2,a3,a4);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viiii(index,a1,a2,a3,a4) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2,a3,a4);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viiiii(index,a1,a2,a3,a4,a5) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2,a3,a4,a5);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiif(index,a1,a2,a3) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)(a1,a2,a3);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)(a1,a2,a3,a4,a5);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_vff(index,a1,a2) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viiiif(index,a1,a2,a3,a4,a5) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2,a3,a4,a5);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viiif(index,a1,a2,a3,a4) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2,a3,a4);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_fi(index,a1) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)(a1);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiiiiiiiiiiiiiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15,a16,a17,a18,a19,a20,a21,a22,a23) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15,a16,a17,a18,a19,a20,a21,a22,a23);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiidi(index,a1,a2,a3,a4) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)(a1,a2,a3,a4);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_vdi(index,a1,a2) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_vdddddddddii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_vdiii(index,a1,a2,a3,a4) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2,a3,a4);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viidi(index,a1,a2,a3,a4) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2,a3,a4);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viif(index,a1,a2,a3) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2,a3);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_vid(index,a1,a2) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_fiii(index,a1,a2,a3) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)(a1,a2,a3);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_diii(index,a1,a2,a3) {
var sp = stackSave();
try {
  return getWasmTableEntry(index)(a1,a2,a3);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viiiiiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viid(index,a1,a2,a3) {
var sp = stackSave();
try {
  getWasmTableEntry(index)(a1,a2,a3);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiiiiij(index,a1,a2,a3,a4,a5,a6,a7) {
var sp = stackSave();
try {
  return dynCall_iiiiiij(index,a1,a2,a3,a4,a5,a6,a7);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_vij(index,a1,a2,a3) {
var sp = stackSave();
try {
  dynCall_vij(index,a1,a2,a3);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiji(index,a1,a2,a3,a4) {
var sp = stackSave();
try {
  return dynCall_iiji(index,a1,a2,a3,a4);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiiiiiij(index,a1,a2,a3,a4,a5,a6,a7,a8) {
var sp = stackSave();
try {
  return dynCall_iiiiiiij(index,a1,a2,a3,a4,a5,a6,a7,a8);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiiij(index,a1,a2,a3,a4,a5) {
var sp = stackSave();
try {
  return dynCall_iiiij(index,a1,a2,a3,a4,a5);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiiiiji(index,a1,a2,a3,a4,a5,a6,a7) {
var sp = stackSave();
try {
  return dynCall_iiiiiji(index,a1,a2,a3,a4,a5,a6,a7);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iij(index,a1,a2,a3) {
var sp = stackSave();
try {
  return dynCall_iij(index,a1,a2,a3);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iijii(index,a1,a2,a3,a4,a5) {
var sp = stackSave();
try {
  return dynCall_iijii(index,a1,a2,a3,a4,a5);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iijiii(index,a1,a2,a3,a4,a5,a6) {
var sp = stackSave();
try {
  return dynCall_iijiii(index,a1,a2,a3,a4,a5,a6);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_jii(index,a1,a2) {
var sp = stackSave();
try {
  return dynCall_jii(index,a1,a2);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_j(index) {
var sp = stackSave();
try {
  return dynCall_j(index);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_jjiii(index,a1,a2,a3,a4,a5) {
var sp = stackSave();
try {
  return dynCall_jjiii(index,a1,a2,a3,a4,a5);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_jd(index,a1) {
var sp = stackSave();
try {
  return dynCall_jd(index,a1);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiiji(index,a1,a2,a3,a4,a5) {
var sp = stackSave();
try {
  return dynCall_iiiji(index,a1,a2,a3,a4,a5);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iijji(index,a1,a2,a3,a4,a5,a6) {
var sp = stackSave();
try {
  return dynCall_iijji(index,a1,a2,a3,a4,a5,a6);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iijj(index,a1,a2,a3,a4,a5) {
var sp = stackSave();
try {
  return dynCall_iijj(index,a1,a2,a3,a4,a5);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_jiji(index,a1,a2,a3,a4) {
var sp = stackSave();
try {
  return dynCall_jiji(index,a1,a2,a3,a4);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_ji(index,a1) {
var sp = stackSave();
try {
  return dynCall_ji(index,a1);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_jiiij(index,a1,a2,a3,a4,a5) {
var sp = stackSave();
try {
  return dynCall_jiiij(index,a1,a2,a3,a4,a5);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_vjii(index,a1,a2,a3,a4) {
var sp = stackSave();
try {
  dynCall_vjii(index,a1,a2,a3,a4);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viij(index,a1,a2,a3,a4) {
var sp = stackSave();
try {
  dynCall_viij(index,a1,a2,a3,a4);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_vji(index,a1,a2,a3) {
var sp = stackSave();
try {
  dynCall_vji(index,a1,a2,a3);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viijiii(index,a1,a2,a3,a4,a5,a6,a7) {
var sp = stackSave();
try {
  dynCall_viijiii(index,a1,a2,a3,a4,a5,a6,a7);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_vijiiij(index,a1,a2,a3,a4,a5,a6,a7,a8) {
var sp = stackSave();
try {
  dynCall_vijiiij(index,a1,a2,a3,a4,a5,a6,a7,a8);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiij(index,a1,a2,a3,a4) {
var sp = stackSave();
try {
  return dynCall_iiij(index,a1,a2,a3,a4);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_jiij(index,a1,a2,a3,a4) {
var sp = stackSave();
try {
  return dynCall_jiij(index,a1,a2,a3,a4);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiiijiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
var sp = stackSave();
try {
  return dynCall_iiiijiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_jiii(index,a1,a2,a3) {
var sp = stackSave();
try {
  return dynCall_jiii(index,a1,a2,a3);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iijiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
var sp = stackSave();
try {
  return dynCall_iijiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_iiiijiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
var sp = stackSave();
try {
  return dynCall_iiiijiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_jiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
var sp = stackSave();
try {
  return dynCall_jiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viiiiiij(index,a1,a2,a3,a4,a5,a6,a7,a8) {
var sp = stackSave();
try {
  dynCall_viiiiiij(index,a1,a2,a3,a4,a5,a6,a7,a8);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viijj(index,a1,a2,a3,a4,a5,a6) {
var sp = stackSave();
try {
  dynCall_viijj(index,a1,a2,a3,a4,a5,a6);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_vijj(index,a1,a2,a3,a4,a5) {
var sp = stackSave();
try {
  dynCall_vijj(index,a1,a2,a3,a4,a5);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viijiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
var sp = stackSave();
try {
  dynCall_viijiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_viiijjii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
var sp = stackSave();
try {
  dynCall_viiijjii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}

function invoke_jiiii(index,a1,a2,a3,a4) {
var sp = stackSave();
try {
  return dynCall_jiiii(index,a1,a2,a3,a4);
} catch(e) {
  stackRestore(sp);
  if (e !== e+0 && e !== 'longjmp') throw e;
  _setThrew(1, 0);
}
}




// === Auto-generated postamble setup entry stuff ===

Module["cwrap"] = cwrap;
Module["setValue"] = setValue;
Module["UTF8ArrayToString"] = UTF8ArrayToString;
Module["addRunDependency"] = addRunDependency;
Module["removeRunDependency"] = removeRunDependency;
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_createLazyFile"] = FS.createLazyFile;
Module["FS_createDevice"] = FS.createDevice;
Module["FS_unlink"] = FS.unlink;
Module["keepRuntimeAlive"] = keepRuntimeAlive;
Module["PThread"] = PThread;
Module["PThread"] = PThread;
Module["wasmMemory"] = wasmMemory;
Module["ExitStatus"] = ExitStatus;

var calledRun;

/**
 * @constructor
 * @this {ExitStatus}
 */
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
}

var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

/** @type {function(Array=)} */
function run(args) {
  args = args || arguments_;

  if (runDependencies > 0) {
    return;
  }

  if (ENVIRONMENT_IS_PTHREAD) {
    initRuntime();
    postMessage({ 'cmd': 'loaded' });
    return;
  }

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
}
Module['run'] = run;

/** @param {boolean|number=} implicit */
function exit(status, implicit) {
  EXITSTATUS = status;

  if (!implicit) {
    if (ENVIRONMENT_IS_PTHREAD) {
      // When running in a pthread we propagate the exit back to the main thread
      // where it can decide if the whole process should be shut down or not.
      // The pthread may have decided not to exit its own runtime, for example
      // because it runs a main loop, but that doesn't affect the main thread.
      exitOnMainThread(status);
      throw 'unwind';
    } else {
    }
  }

  if (keepRuntimeAlive()) {
  } else {
    exitRuntime();
  }

  procExit(status);
}

function procExit(code) {
  EXITSTATUS = code;
  if (!keepRuntimeAlive()) {
    PThread.terminateAllThreads();
    if (Module['onExit']) Module['onExit'](code);
    ABORT = true;
  }
  quit_(code, new ExitStatus(code));
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

if (ENVIRONMENT_IS_PTHREAD) {
  // The default behaviour for pthreads is always to exit once they return
  // from their entry point (or call pthread_exit).  If we set noExitRuntime
  // to true here on pthreads they would never complete and attempt to
  // pthread_join to them would block forever.
  // pthreads can still choose to set `noExitRuntime` explicitly, or
  // call emscripten_unwind_to_js_event_loop to extend their lifetime beyond
  // their main function.  See comment in src/worker.js for more.
  noExitRuntime = false;
  PThread.initWorker();
}

run();





