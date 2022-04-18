class Vector3 
{
    constructor(x, y, z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    toArr()
    {
        return [this.x, this.y, this.z];
    }

    add(b)
    {
        return new Vector3(this.x + b.x, this.y + b.y, this.z + b.z);
    }
}

function V3(x, y, z)
{
    return [x, y, z];
}

function V3(v)
{
    return [v.x, v.y, v.z];
}